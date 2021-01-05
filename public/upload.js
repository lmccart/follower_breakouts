// Setup firebase app
let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { });
db = firebase.firestore(app);


let rooms = {
  ts: new Date().getTime()
};

$('#submit').on('click', submit);

function submit(e) {
  e.preventDefault();
  $('#breakoutsForm').hide();
  $('#analyzing').show();
  let input = document.getElementById('breakouts');
  let files = $('#breakouts').prop('files');
  if (files && files[0]) {
    let reader = new FileReader();
    reader.addEventListener('load', function (e) {
      let data = e.target.result; 
      let result = parseCSV(data);
      let final = pairRooms(result);
      db.collection('rooms').doc(new Date().toTimeString()).set(final);
      $('#analyzing').hide();
      $('#thankyou').show();
      setTimeout(function(){ window.location = '/'; }, 3000);
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
          participants: []
        };
      }
      if (participant.includes('Facilitator')) {
        participant = participant.replace('(Facilitator)', '');
        participant = participant.replace('Facilitator', '');
        rooms[roomname].host = participant;
      } else {
        participant = participant.replace('(Guest)', '');
        rooms[roomname].participants.push(participant);
      }
    }
  }
  console.log(parsedata);
  return rooms;
}

function pairRooms(data) {
  for (let key in data) {
    if (data.hasOwnProperty(key) && data[key].participants) {
      let participants = data[key].participants;
      if (participants.length % 2 !== 0) {
        participants.push(data[key].host);
      }
      let result = shuffle(participants);
      data[key].paired = result;
    }
  }
  console.log(data);
  return data;
}


function shuffle(xs) {
  return xs.slice(0).sort(function() {
    return .5 - Math.random();
  });
};
