/* Justin Wong */
/* global Chart, moment */

const output = document.getElementById('output');
const summary = document.querySelector('#summary');
const checkboxAll = document.getElementById('check-all');
const context = document.querySelector('#line-chart-canvas').getContext('2d');
var lineChart = undefined;
const categories = ['valence', 'energy', 'acousticness', 'popularity'];
var monthBeginnings = [0];

checkboxAll.addEventListener('change', e => {
    const list = document.querySelector('#check-list');
    let checkboxes = Array.from(list.querySelectorAll('input'));
    
//    const evt = new Event('change');
//    checkboxes.map(cb => {
//        cb.checked = checkboxAll.checked;
//        cb.dispatchEvent(evt);
//    });
    
    checkboxes.map(cb => cb.checked = checkboxAll.checked);
    let songs = checkboxAll.checked ?
        allSongData() : [];
    adjustData(lineChart, dataByMonthlyAvg(songs));
});

let currentSongData = (val) => {
    currentSongData.val = val ?
        val : currentSongData.val;
    console.log(currentSongData.val);
    return currentSongData.val;
}

let allSongData = (val) => {
  allSongData.val = val ?
    val : allSongData.val;
  return allSongData.val;
}

let dataInMonth = (month) => {
    let songs = allSongData(),
        start = monthBeginnings[month],
        end = (month == monthBeginnings.length - 1) ? 
            songs.length : monthBeginnings[month+1];
    return songs.splice(start, end);
}

let dataByMonthlyAvg = (songs) => {
    
    currentSongData(songs);
    
    if (songs.length == 0) {return []}

  
  songs = songs.sort((a, b) => a.added_at.localeCompare(b.added_at));
    
  let dataPerCategory = {};
  categories.map(c => {dataPerCategory[c] = []});
  
  // let monthBeginnings = [0];
  
  let i = 0,
      n = songs.length,
      firstMonth = moment(songs[0].added_at).endOf('month'),
      monthEnd = firstMonth;  
  while (i < n) {
    
    let monthlyDataPerCategory = {};
    categories.map(c => {monthlyDataPerCategory[c] = []});

    while (i < n) {
      let song = songs[i];
        let monthEndISOStr = monthEnd.toISOString();
//      if (moment(song.added_at).isBefore(monthEnd)) {
      if (song.added_at < monthEndISOStr) {
        
        categories.map(c => monthlyDataPerCategory[c].push(song[c]));
        i++;
      }
      else {
        break;
      }
    }
    let numSongs = monthlyDataPerCategory[categories[0]].length;
    if (numSongs > 0) {
      
      categories.map(c => {
        let avg = monthlyDataPerCategory[c].reduce((tot, v) => tot + v) / numSongs;
        dataPerCategory[c].push({
          x: monthEnd.clone(),
          y: avg
        })
      });
      monthBeginnings.push(i);
    }
      // add empty data to change animation
//      else {
//        categories.map(c => {
//          dataPerCategory[c].push({
//              x: monthEnd.clone(),
//              y: 0
//          });
//        });
//      }
    monthEnd.add(1, 'month');    
  }
  monthBeginnings.pop();
    
  return dataPerCategory;
}

let removePlaylistFrom = (songs, playlistId) => {
    return songs.filter(song => song.playlist != playlistId);
}

let addPlaylistTo = (songs, playlistId) => {
    let newSongs = allSongData().filter(song => song.playlist == playlistId);
    return songs.concat(newSongs);
}

let emptyDatasets = (setLabels) => {

    const colors = ['rgb(255, 0, 0)', 'rgb(0, 128, 255)', 'rgb(0, 0, 255)', 'rgb(255, 255, 0)', 'rgb(255, 128, 0)'];
  let colorsFor = {};
  let j = 0;
  let m = setLabels.length;
  for (j; j < m; j++) {
    colorsFor[setLabels[j]] = colors[j];
  }
  
  return setLabels.map(c => ({
    label: c,
    borderColor: colorsFor[c],
      pointBackgroundColor: colorsFor[c],
    fill: false,
    data: []
  }));
}
    
let initChart = () => {
    let songs = allSongData();
    let firstDate = moment(songs[0].added_at);
    let lastDate = moment(songs[songs.length-1].added_at).add(1, 'month');

    let config = {
      type: 'line',
      data: {
        datasets: emptyDatasets(categories)   
      },
      options: {
        title: {
          text: 'Title'
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              let label = data.datasets[tooltipItem.datasetIndex].label
              label += ': ' + Math.round(tooltipItem.value * 100) / 100;
              return label;
            }
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              tooltipFormat: 'MMM YYYY',
                min: firstDate,
                max: lastDate
            },
            scaleLabel: {
              display: false,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: false,
              labelString: 'value'
            },
            ticks: {
              min: 0,
              max: 1
            }
          }]
        },
          animation: {
//              duration: 0
          }
      }
    }

  lineChart = new Chart(context, config);
  adjustData(lineChart, dataByMonthlyAvg(songs));
    
    let canvas = document.querySelector('canvas');
    canvas.addEventListener('click', evt => {
        let pt = lineChart.getElementAtEvent(evt)[0];
                
        
        console.log(pt)
        
        if (pt) {        
            let dataset = lineChart.data.datasets[pt._datasetIndex];
            let monthMoment = dataset.data[pt._index].x;
            
            displayMonthSummary(monthMoment);
        }
    });
}

let adjustData = (chart, dataPerCategory) => {
//  config.data.datasets.map(dataset => {
  chart.data.datasets.map(dataset => {
    let category = dataset.label;
    dataset.data = dataPerCategory[category];
  });
  chart.update();
}

let displayMonthSummary = (monthMoment) => {
    let end = monthMoment.endOf('month').toISOString();
    let start = monthMoment.startOf('month').toISOString();
    let monthDisplayStr = monthMoment.format('MMMM YYYY');
    
    let songs = currentSongData();
    let songsInMonth = songs.filter(s => {
        let d = s.added_at;
        return (d >= start && d <= end)
    });
    
    let numSongs = songsInMonth.length;
    
    let totalStats = {};
    categories.map(c => {totalStats[c] = 0});
    
    songsInMonth.map(s => {
        categories.map(c => {totalStats[c] += s[c]});
    })
    let avgStats = Object.assign({}, ...categories.map(c => {
        return {[c]: totalStats[c] / numSongs};
    }));
    
    //// display
    
    while (summary.lastElementChild) {
        summary.removeChild(summary.lastElementChild);
    }
    
    let h = document.createElement('h4');
    h.textContent = monthDisplayStr;    
    
    let p = document.createElement('p');
    p.textContent = 'Songs this month: ' + numSongs;

    let ul = document.createElement('ul');
    let lis = songsInMonth.map(s => {
        let li = document.createElement('li');
        li.textContent = s.name;
        ul.appendChild(li);
    });
    
    summary.appendChild(h);
    summary.appendChild(p);
    summary.appendChild(ul);    
}

let accessToken = (val) => {
  accessToken.val = val ? 
    val : accessToken.val;
  return accessToken.val;
}

let defaultHeaders = () => {
  return {'Authorization': 'Bearer ' + accessToken()}
};

let fetchSettings = () => {
  return {
    method: 'GET',
    cache: 'force-cache',
    // cache: 'no-store',
    headers: defaultHeaders()
  };
}

let getAllPlaylists = async () => {
  let firstUrl = 'https://api.spotify.com/v1/me/playlists';
  return recursePagingObj(firstUrl, []);
}

let getTracksInPlaylist = async (id) => {
  let firstUrl = 'https://api.spotify.com/v1/playlists/' + id + '/tracks';
  return recursePagingObj(firstUrl, [])
  .then(trackObjs => trackObjs.map(obj => ({
    added_at: obj.added_at,
    // is_local: obj.is_local,
    // album: obj.track.album,
    // artists: obj.track.artists,
    duration_ms: obj.track.duration_ms,
    explicit: obj.track.explicit,
    id: obj.track.id,
    name: obj.track.name,
    popularity: obj.track.popularity / 100
  })));
}

let getAudioForMultipleTracks = async (idList) => {
  const baseUrl = 'https://api.spotify.com/v1/audio-features/?ids=';

  let promises = splitIntoGroups(idList).map(idSublist => {
    let url = baseUrl + idSublist.join(',');
    return fetch2(url, fetchSettings())
      .then(response => response.json())
      .then(obj => obj.audio_features);
  });

  // return Promise.all(promises)
  return promiseChain(promises)
  .then(results => [].concat(...results));
}

let getSpecialAudioAnalysis = async (audioForTrack) => {
  return fetch2(audioForTrack.analysis_url, fetchSettings())
  .then(response => response.json());
}

let getAllSongData = async () => {
  
  return getAllPlaylists()
  .then(allPlaylists => allPlaylists.map(playlist => (
    getTracksInPlaylist(playlist.id)
    .then(trackObjs => trackObjs.map(obj => Object.assign({}, obj, {
      playlist: playlist.id,
    })))
  )))
  // .then(promisesGettingTracks => Promise.all(promisesGettingTracks))
  .then(promisesGettingTracks => promiseChain(promisesGettingTracks))
  .then(allTracksChunked => {
    let allTracks = [].concat(...allTracksChunked);
    
    //allTracks = uniqueBy(allTracks, (item) => item.id);    // conflicts with 'remove with playlist' feature
    allTracks = allTracks.filter(track => track.id != null)
    // allTracks.sort((a, b) => a.added_at.localeCompare(b.added_at));
    return allTracks;
  })
  .then(async (allTracks) => {
    let allAudio = await getAudioForMultipleTracks(allTracks.map(track => track.id));
    console.log(allTracks.length)
    console.log(allAudio.length)
    
    return allTracks.map((track, i) => {
      let audio = allAudio[i];
      return Object.assign({}, track, {
        acousticness: audio.acousticness,
        valence: audio.valence,
        danceability: audio.danceability,
        energy: audio.energy,
        loudness: audio.loudness,
        tempo: audio.tempo,
        analysis_url: audio.analysis_url
      });
    }).sort((a, b) => a.added_at.localeCompare(b.added_at));
;
  });
}

let uniqueBy = (arr, funcGetSortVal) => {
  let seen = {};
  return arr.filter(item => {
    let id = funcGetSortVal(item);
    return (id == null || seen.hasOwnProperty(id)) ? 
      false : (seen[id] = true);
  });
}

let splitIntoGroups = (arr) => {
  const maxGroupSize = 100;  
  let groups = [],
      i = 0,
      n = arr.length;
  while (i < n) {
    groups.push( arr.slice(i, i+= maxGroupSize) );
  }
  return groups;
}

let recursePagingObj = async (nextUrl, items) => {
  
  return fetch2(nextUrl, fetchSettings())
  .then(response => response.json())
  .then(response => {
    items = items.concat(...response.items);
    
    return response.next == null ? 
      items : recursePagingObj(response.next, items);
  });
}

let promiseChain = async (promisesArr) => {
  let results = [],
      i = 0,
      n = promisesArr.length;
  for (i; i < n; i++) {
    console.log('iteration '+i+' of synch promise chain')
    // await sleep(500);
    // let r = await promisesArr[i].catch(async (error) => {
    //   console.log('error in promise chain; going to wait');
    //   await sleep(5000);
    //   return promiseChain(promisesArr)
    // });
    let r = await promisesArr[i];
    results.push(r);
  }
  return results;
}

let fetch2 = async (url, settings) => {
  let res = await fetch(url, settings)
  .then(async response => {
    if (!response.ok) {
      console.log(response.statusText);

      if (response.status == 401) {  // unauthorized so burst cache
        // should also refresh access token
        let newSettings = {...settings};
        newSettings.cache = 'default';
        // newSettings.headers = defaultHeaders();
        return fetch(url, newSettings);
      }
      else if (response.status == 429) {  // too many requests; slow down
        let timeoutSecs = response.headers.get('retry');
        console.log('going to retry in a few secs');
        // return setTimeout(() => {
        //   console.log('retrying');
        //   return fetch(url, settings);
        // }, timeoutSecs * 1000);
        // forceSleep(timeoutSecs);
        await sleep(2000);
        
        return fetch(url, settings);
      }
    } else {return response;}
  });
  return res;
}

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function forceSleep(ms) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < ms);
}

let main = async () => {
  
  await fetch2('/music2/access', {cache: 'no-store'})
  .then(response => response.text())
  .then(token => accessToken(token));

  await getAllPlaylists()
  .then(playlists => {
    playlists.map(playlist => {
      let outputStr = playlist.name;
      let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'name';//playlist.name;
        checkbox.value = 'value';//playlist.name;
        checkbox.id = playlist.id;
        checkbox.checked = true;
        
        const list = document.getElementById('check-list');
        
        checkbox.addEventListener('change', e => {
            let updatedSongs;
            if (checkbox.checked) {
                updatedSongs = addPlaylistTo(currentSongData(), playlist.id);
            }
            else {
                updatedSongs = removePlaylistFrom(currentSongData(), playlist.id);
            }
            adjustData(lineChart, dataByMonthlyAvg(updatedSongs));
        });
        
        let lbl = document.createElement('label');
        lbl.htmlFor = playlist.id;
        lbl.textContent = playlist.name;
      list.appendChild(checkbox);    
        list.appendChild(lbl);
    });
  })


  context.font = "24px helvetica";
  context.fillText("Loading...", 10, 50);

  await getAllSongData()
  .then(data => allSongData(data));
  initChart();
    console.log('finished init');
  
  // output.textContent = JSON.stringify(allSongData());

}

main();