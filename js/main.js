require(['jquery', 'vendor/knockout'], function($, ko) {

  var resource = {
    url: 'http://adaptive-test-api.herokuapp.com/tweets.json',
    fetchNewTweets: function() {
      return $.ajax({
        url: this.url,
        dataType: 'json'
      });
    }
  };

  function Tweet(handle, time, sentiment, message) {
    this.handle = handle;
    this.time = time;
    this.sentiment = sentiment;
    this.message = message;
    this.formattedTime = time; //todo: do formatting
  }

  function createTweet(tweetObj) {
    return new Tweet(tweetObj.user_handle, tweetObj.created_at, tweetObj.sentiment, tweetObj.message);
  }

  var viewModel = {
    tweets: ko.observableArray()
  };

  viewModel.hasNoTweets = ko.computed(function() {
    return this.tweets().length === 0;
  }, viewModel);


  $(function() {

    ko.applyBindings(viewModel, document.getElementById('container'));

    resource.fetchNewTweets()
      .done(function(response) {
        var tweets = ko.utils.arrayMap(response, createTweet);

        ko.utils.arrayForEach(tweets, function(t) {
          viewModel.tweets.push(t);
        });
      })
      .fail(function(error) {
        alert('oops: ' + error);
      });
  });



});
