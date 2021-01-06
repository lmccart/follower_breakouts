let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { });
db = firebase.firestore(app);

let rooms = {
  ts: new Date().getTime()
};

$('#submit').on('click', submit);
$('#clear_db').on('click', clearPeople);

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
      let result = parseWriteCSV(data);
      let final = pairRooms(result);
      // db.collection('rooms').doc(new Date().toTimeString()).set(final);
      $('#analyzing').hide();
      $('#thankyou').show();
      // setTimeout(function(){ window.location = '/'; }, 3000);
    });
    reader.readAsBinaryString(files[0]);
  }
};

function parseWriteCSV(data) {
  let batch = db.batch();

  let parsedata = [];
  let newline = data.split("\n");
  for(let i = 0; i < newline.length; i++) {
    if (i > 0 && newline[i].length > 1) {
      console.log(newline[i])
      let line = newline[i].split(",");
      parsedata.push(line);
      let name = line[2];

      let person = {
        room: line[0],
        participant: name.replace('(Facilitator)', ''),
        email: line[1],
        host: name.includes('Facilitator'),
        id: makeid()
      }
      
      let ref = db.collection('people').doc(person.id);
      batch.set(ref, person);
    }
  }
  batch.commit().then(function () {
    console.log(parsedata);
    return rooms;
  });
}

function makeid() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  result += Date.now();
  return result;
}