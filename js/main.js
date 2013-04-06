require(['jquery', 'vendor/knockout', 'tweetfilter', 'notyconfig'], function($, ko, TweetFilter) {

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

        if(!filtered.length) {
          noty({text: "No new tweets"});
        }

        var tweets = ko.utils.arrayMap(filtered, createTweet);

        ko.utils.arrayForEach(tweets, function(t) {
          viewModel.tweets.unshift(t);
        });
      })
      .fail(function(error) {
        noty({text: 'Sorry, can\'t get your tweets now. Try again a little later.', type: 'error'});
      })
      .always(function() {
        setTimeout(function() {
          viewModel.loading(false);
        }, 300);
      });
    }
  };

  viewModel.hasNoTweets = ko.computed(function() {
    return this.tweets().length === 0;
  }, viewModel);

  viewModel.loadButtonText = ko.computed(function() {
    return this.loading() ? 'Loading...' : 'MOAR';
  }, viewModel);



  $(function() {
    ko.applyBindings(viewModel, document.getElementById('container'));
    viewModel.fetchNew();
  });
});
