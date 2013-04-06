require(['jquery', 'vendor/knockout', 'tweetfilter'], function($, ko, TweetFilter) {

  /* adaptive lab's endpoint. makes the call to their server and returns the promise (deferred). */
  var adaptiveLab = {
    url: 'http://adaptive-test-api.herokuapp.com/tweets.json',
    fetchNewTweets: function() {
      return $.ajax({
        url: this.url,
        dataType: 'json'
      });
    }
  };

  var sentimentMap = {
    visualise: function(sentiment) {
      if(sentiment < -0.5) {
        return ':(';
      } else if(sentiment < 0.5) {
        return ':|';
      } else {
        return ':)';
      }
    }
  };

  function Tweet(handle, time, sentiment, message) {
    var date = new Date(time);

    this.handle = handle;
    this.time = date.getHours() + ':' + date.getMinutes();
    this.sentiment = sentimentMap.visualise(sentiment);
    this.message = message;
    this.formattedTime = this.time; //todo: do formatting
  }

  function createTweet(tweetObj) {
    return new Tweet(tweetObj.user_handle, tweetObj.created_at, tweetObj.sentiment, tweetObj.message);
  }

  var filter = new TweetFilter();

  var viewModel = {
    loading: ko.observable(false),
    tweets: ko.observableArray(),
    fetchNew: function() {
      this.loading(true);
      adaptiveLab.fetchNewTweets()
      .done(function(response) {

        var filtered = filter.filterTweets(response);

        var tweets = ko.utils.arrayMap(filtered, createTweet);

        ko.utils.arrayForEach(tweets, function(t) {
          viewModel.tweets.unshift(t);
        });
      })
      .fail(function(error) {
        console.log('oops: ' + error); //todo: display friendly message
      })
      .always(function() {
        viewModel.loading(false);
      });
    }
  };

  viewModel.hasNoTweets = ko.computed(function() {
    return this.tweets().length === 0;
  }, viewModel);

  $(function() {

    ko.applyBindings(viewModel, document.getElementById('container'));

    viewModel.fetchNew();

  });
});
