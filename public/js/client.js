/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;


// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize({
    // NOTE about asynchronous responses
    // If you need to make an asynchronous request or action before you can reply to Trello
    // you can return a Promise (bluebird promises are included at TrelloPowerUp.Promise)
    // The Promise should resolve to the object type that is expected to be returned
    'attachment-sections': function (t, options) {
        // options.entries is a list of the attachments for this card
        // you can look through them and 'claim' any that you want to
        // include in your section.

        // we will just claim urls for Yellowstone
        var claimed = options.entries.filter(function (attachment) {
            return attachment.url.indexOf('http://www.nps.gov/yell/') === 0;
        });

        // you can have more than one attachment section on a card
        // you can group items together into one section, have a section
        // per attachment, or anything in between.
        if (claimed && claimed.length > 0) {
            // if the title for your section requires a network call or other
            // potentially length operation you can provide a function for the title
            // that returns the section title. If you do so, provide a unique id for
            // your section
            return [{
                id: 'Yellowstone', // optional if you aren't using a function for the title
                claimed: claimed,
                title: 'Example Attachment Section: Yellowstone',
                content: {
                    type: 'iframe',
                    url: t.signUrl('./section.html', {arg: 'you can pass your section args here'}),
                    height: 230
                }
            }];
        } else {
            return [];
        }
    },



    'card-from-url': function (t, options) {
        // options.url has the url in question
        // if we know cool things about that url we can give Trello a name and desc
        // to use when creating a card. Trello will also automatically add that url
        // as an attachment to the created card
        // As always you can return a Promise that resolves to the card details

        return new Promise(function (resolve) {
            resolve({
                name: '💻 ' + options.url + ' 🤔',
                desc: 'This Power-Up knows cool things about the attached url'
            });
        });

        // if we don't actually have any valuable information about the url
        // we can let Trello know like so:
        // throw t.NotHandled();
    },
    'format-url': function (t, options) {
        // options.url has the url that we are being asked to format
        // in our response we can include an icon as well as the replacement text

        return {
            icon: GRAY_ICON, // don't use a colored icon here
            text: '👉 ' + options.url + ' 👈'
        };

        // if we don't actually have any valuable information about the url
        // we can let Trello know like so:
        // throw t.NotHandled();
    },
    'authorization-status': function (t) {
        return new TrelloPowerUp.Promise((resolve) =>

            t.get('board', 'shared', 'credentials')
                .then(function (credentials) {
                    if (credentials) {
                        console.log(credentials)
                        resolve({authorized: true})
                    }
                    else {
                        resolve({authorized: false})
                    }

                })
        )
    },
    'show-authorization': function (t, options) {
        // return what to do when a user clicks the 'Authorize Account' link
        // from the Power-Up gear icon which shows when 'authorization-status'
        // returns { authorized: false }
        // in this case we would open a popup
        return t.popup({
            title: 'Authozire AirTable',
            url: './authorize.html', // this page doesn't exist in this project but is just a normal page like settings.html
            height: 250,
        });
    },
    'show-settings': function (t, options) {
        // when a user clicks the gear icon by your Power-Up in the Power-Ups menu
        // what should Trello show. We highly recommend the popup in this case as
        // it is the least disruptive, and fits in well with the rest of Trello's UX
        return t.popup({
            title: 'Settings',
            url: './settings.html',
            height: 250, // we can always resize later, but if we know the size in advance, its good to tell Trello
        });
    }
});

console.log('Loaded by: ' + document.referrer);
  
