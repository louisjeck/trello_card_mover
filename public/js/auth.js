
$(document).ready(function(){

  var p = document.getElementById('p');
  var status = document.getElementById('status')
  
  function createWebhooks(){
  getWebhooks(function(webhooks){
    console.log(webhooks)
  })

    console.log("create")

      Trello.rest("POST", "webhooks", 
                  
              {'idModel': model, 
               'description' : "Checkbox Template", 
               'callbackURL' : "https://card-mover.glitch.me/webhooks?token="+Trello.token()
              }, 
              function(){ 
                p.innerHTML+="Webhook creation : OK"
                status.innerHTML="ok"
                //closeTab();
              },
              function(){ 
                p.innerHTML+="Webhook creation : Error (this webhook might already exist)"
                status.innerHTML="ko"
                console.log("error")  
                //closeTab();
  });
  }
  
  function deleteWebhook(webhook, callback){
    return Trello.rest("DELETE", "webhooks/"+webhook.id, callback)
  }
  
  function getWebhooks(callback){
    return Trello.rest("GET", "tokens/"+Trello.token()+"/webhooks", callback)
  }
  
  function deleteWebhooks(){
      getWebhooks(function(webhooks){
        webhooks.forEach(function(webhook){
          deleteWebhook(webhook, function(){
            p.innerHTML+="Webhook "+webhook.id+" successfully deleted<br>"
          })  
        })
    
      })   
  }
  
  
  
  var authenticationSuccess = function() { 
    console.log('Successful authentication'); 
    p.innerHTML += "Trello authentication : OK<br>"
    if(window.location.hash == "#deauth")
      deleteWebhooks();
    else
      createWebhooks();

  };
  
  
  var authenticationFailure = function() { 
    p.innerHTML += "Authentication : Error"
    console.log('Failed authentication'); 
  };

function closeTab(){
  setTimeout(function(){
      close();

  }, 2000)
}


  
  
  Trello.authorize({
    type: 'redirect',
    name: 'Trello Card Mover',
    scope: {
      read: 'allowRead',
      write: 'allowWrite' },
    expiration: 'never',
    success: authenticationSuccess,
    error: authenticationFailure
  });
  
  })