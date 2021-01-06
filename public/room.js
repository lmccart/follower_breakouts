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
  let elm = $('<div class="person"><input type="text" class="name" value="'+data.name+'" data-id="'+data.id+'"><input type="checkbox" class="present" data-id="'+data.id+'"></div>');
  $('#people').append(elm);

  if (data.host) {
    elm.addClass('host');
  }
  if (data.present) {
    elm.find('input').prop('checked', true);
  }
  elm.find('input[type="text"]').on('change', rename);
  elm.find('input[type="checkbox"]').on('change', attendance);
}

function rename(e) {
  $('#assignments').hide();
  let id = $(e.target).data('id');
  let newname = $(e.target).val();
  console.log(id, newname);
  db.collection('people').doc(id).update({name: newname});
}

function attendance(e) {
  $('#assignments').hide();
  let id = $(e.target).data('id');
  let checked = $(e.target).prop('checked');
  db.collection('people').doc(id).update({present: checked});
}

function generate() {
  $('#assignments').show();
  let people = [];
  let elts = $('.person');
  $('.person').each(function(i, obj) {
    if ($(obj).find('.present').prop('checked')) {
      if (elts.length % 2 == 0 || !$(obj).hasClass('host')) {
        people.push($(obj).find('.name').val())
      }
    }
  });
  people = shuffle(people);
  console.log(people)
  displayAssignments(people);
}

function displayAssignments(people) {
  $('#messages').empty();
  $('#sorry').hide();
  
  if (people.length < 2) {
    $('#sorry').show();
    return;
  }

  for (let p=0; p <people.length; p+=2) {
    let a = people[p];
    let texta = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + a;
    let b = people[p+1];
    let textb = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + b;
    $('#messages').append('<div id="clip'+p+'" class="message"><span class="instruct"><b>'+a+'</b><br>'+textb+'<img src="clip.png"></span> <span class="copied">copied!</span></div>');
    $('#messages').append('<div id="clip'+(p+1)+'" class="message"><span class="instruct"><b>'+b+'</b><br>'+texta+'<img src="clip.png"></span> <span class="copied">copied!</span></div>');
    $('#clip'+p).click(function() { copyToClipboard($(this), textb); });
    $('#clip'+(p+1)).click(function() { copyToClipboard($(this), texta); });
  }
}

function shuffle(xs) {
  return xs.slice(0).sort(function() {
    return .5 - Math.random();
  });
}

function copyToClipboard(elem, text) {
  $(elem).find('.copied').fadeIn(0).delay(1000).fadeOut(0);
  let $temp = $('<input>');
  $('body').append($temp);
  $temp.val(text).select();
  document.execCommand('copy');
  $temp.remove();
}