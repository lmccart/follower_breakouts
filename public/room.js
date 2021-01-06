let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { });
db = firebase.firestore(app);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
console.log(id);
$('h1').text(id);

$('#generate').on('click', generate);

db.collection('people').where("room", "==", id)
  .get()
  .then(function(snapshot) {
    snapshot.forEach(function(doc) {
      console.log(doc.id, " => ", doc.data());
      displayPerson(doc.data());
    });
  });

function displayPerson(data) {
  let elm = $('<div class="person"><span class="name">'+data.participant+'</span><input type="checkbox" data-id="'+data.id+'"></div>');
  $('#people').append(elm);

  if (data.host) {
    elm.addClass('host');
  }
  if (data.present) {
    elm.find('input').prop('checked', true);
  }
  elm.find('input').on('change', attendance);
}

function attendance(e) {
  let id = $(e.target).data('id');
  let checked = $(e.target).prop('checked');
  db.collection('people').doc(id).update({present: checked});
}

function generate() {
  $('#messages').show();
}


// function displayRooms(data) {
//   Object.keys(data)
//   .sort()
//   .forEach(function(key, i) {
//     displayRoom(data[key], key, i);
//    });
// }

// function displayRoom(data, key, i) {
//   if (data.paired) {
//     console.log(data)
//     $('body').append('<h1>'+key+'</h1>');
//     $('body').append('<div id="room'+i+'" class="room"></div>');
//     for (let p=0; p <data.paired.length; p+=2) {
//       let a = data.paired[p];
//       let texta = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + a;
//       let b = data.paired[p+1];
//       let textb = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + b;
//       $('#room'+i).append('<div id="clip'+p+'" class="person"><span class="instruct"><b>'+a+'</b><br>'+textb+'<img src="clip.png"></span> <span class="copied">copied!</span></div>');
//       $('#room'+i).append('<div id="clip'+(p+1)+'" class="person"><span class="instruct"><b>'+b+'</b><br>'+texta+'<img src="clip.png"></span> <span class="copied">copied!</span></div>');
//       $('#room'+i+' #clip'+p).click(function() { copyToClipboard($(this), textb); });
//       $('#room'+i+' #clip'+(p+1)).click(function() { copyToClipboard($(this), texta); });
//     }
//   }
// }






      // if (!rooms.hasOwnProperty(roomname)) {
      //   rooms[roomname] = {
      //     host: "",
      //     participants: []
      //   };
      // }
      // if (participant.includes('Facilitator')) {
      //   participant = participant.replace('(Facilitator)', '');
      //   rooms[roomname].host = participant;
      // } else {
      //   participant = participant.replace('(Guest)', '');
      //   rooms[roomname].participants.push(participant);
      // }



// function pairRooms(data) {
//   for (let key in data) {
//     if (data.hasOwnProperty(key) && data[key].participants) {
//       let participants = data[key].participants;
//       if (participants.length % 2 !== 0) {
//         participants.push(data[key].host);
//       }
//       let result = shuffle(participants);
//       data[key].paired = result;
//     }
//   }
//   console.log(data);
//   return data;
// }


// function shuffle(xs) {
//   return xs.slice(0).sort(function() {
//     return .5 - Math.random();
//   });
// };


function copyToClipboard(elem, text) {
  $(elem).find('.copied').fadeIn(0).delay(1000).fadeOut(0);

  let $temp = $('<input>');
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand('copy');
  $temp.remove();
}