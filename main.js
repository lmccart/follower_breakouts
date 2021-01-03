// Setup firebase app
  let app = firebase.app();
  firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
  firebase.auth().onAuthStateChanged(function(user) { });
  db = firebase.firestore(app);


let rooms = {
  ts: firebase.getTimestamp()
};

$('#submit').on('click', submit);

function submit(e) {
  e.preventDefault();
  let input = document.getElementById('breakouts');
  let files = $('#breakouts').prop('files');
  if (files && files[0]) {
    let reader = new FileReader();
    reader.addEventListener('load', function (e) {
      let data = e.target.result; 
      let result = parseCSV(data);
      let final = pairRooms(result);
      db.collection('rooms').add(final);
    });
    reader.readAsBinaryString(files[0]);
  }
};

function parseCSV(data) {
  let parsedata = [];
  let newline = data.split("\n");
  for(let i = 0; i < newline.length; i++) {
    if (i > 3 && newline[i].length > 1) {
      let line = newline[i].split(",");
      parsedata.push(line)
      let roomname = line[0];
      let participant = line[1];
      if (!rooms.hasOwnProperty(roomname)) {
        rooms[roomname] = {
          host: "",
          participants: [],
          room: true
        };
      }
      if (participant.includes('Facilitator')) {
        rooms[roomname].host = participant;
      } else {
        rooms[roomname].participants.push(participant);
      }
    }
  }
  console.log(parsedata);
  return rooms;
}

function pairRooms(data) {
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      let participants = data[key].participants;
      if (participants.length % 2 !== 0) {
        participants.push(data[key].host);
      }
      let result = zip(splitAt(participants.length/2, shuffle(participants)));
      data[key].paired = result;
    }
  }
  console.log(data);
  return data;
}

function splitAt(i, xs) {
  var a = xs.slice(0, i);
  var b = xs.slice(i, xs.length);
  return [a, b];
};

function shuffle(xs) {
  return xs.slice(0).sort(function() {
    return .5 - Math.random();
  });
};

function zip(xs) {
  return xs[0].map(function(_,i) {
    return xs.map(function(x) {
      return x[i];
    });
  });
}
