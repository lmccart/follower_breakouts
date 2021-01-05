let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { });
db = firebase.firestore(app);

db.collection('rooms').orderBy("ts", "desc").limit(1)
  .get()
  .then(function(snapshot) {
    snapshot.forEach(function(doc) {
      console.log(doc.id, " => ", doc.data());
      displayRooms(doc.data());
    });
  });


function displayRooms(data) {
  Object.keys(data)
  .sort()
  .forEach(function(key, i) {
    displayRoom(data[key], key, i);
   });
}

function displayRoom(data, key, i) {
  if (data.paired) {
    console.log(data)
    $('body').append('<h1>'+key+'</h1>');
    $('body').append('<div id="room'+i+'" class="room"></div>');
    for (let p=0; p <data.paired.length; p+=2) {
      let a = data.paired[p];
      let texta = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + a;
      let b = data.paired[p+1];
      let textb = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + b;
      $('#room'+i).append('<div id="clip'+p+'" class="person"><span class="instruct"><b>'+a+'</b><br>'+textb+'<img src="clip.png"></span> <span class="copied">copied!</span></div>');
      $('#room'+i).append('<div id="clip'+(p+1)+'" class="person"><span class="instruct"><b>'+b+'</b><br>'+texta+'<img src="clip.png"></span> <span class="copied">copied!</span></div>');
      $('#room'+i+' #clip'+p).click(function() { copyToClipboard($(this), textb); });
      $('#room'+i+' #clip'+(p+1)).click(function() { copyToClipboard($(this), texta); });
    }
  }
}

function copyToClipboard(elem, text) {
  $(elem).find('.copied').fadeIn(0).delay(1000).fadeOut(0);

  let $temp = $('<input>');
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand('copy');
  $temp.remove();
}