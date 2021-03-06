require(['jquery', 'vendor/knockout', 'tweetfilter', 'notyconfig'], function($, ko, TweetFilter) {

  /* adaptive lab's endpoint. makes the call to their server and returns the promise/deferred. */
  var adaptiveLab = {
    url: 'http://adaptive-test-api.herokuapp.com/tweets.json',
    fetchNewTweets: function() {
      return $.ajax({
        url: this.url,
        dataType: 'json'
      });
    }
  };

  /* could pull this out into it's own component later */
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

  var compare = function(a, b) {
    if(a.localeCompare) {
      return a.localeCompare(b);
    } else {
      return a - b;
    }
  };

  function Tweet(id, handle, time, sentiment, message) {
    var date = new Date(time);

    this.dateCreated = date;
    this.id = id;
    this.handle = handle;
    this.time = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() +
                  ' ' + date.getHours() + ':' + date.getMinutes();
    this.visualSentiment = sentimentMap.visualise(sentiment);
    this.message = message;
    this.formattedTime = this.time; //todo: do proper formatting (date.js ?)
    this.sentiment = sentiment;
  }

  function createTweet(tweetObj) {
    return new Tweet(
      tweetObj.id,
      tweetObj.user_handle,
      tweetObj.created_at,
      tweetObj.sentiment,
      tweetObj.message
    );
  }

  /* removes duplicate tweets */
  var filter = new TweetFilter();

  var viewModel = {
    loading: ko.observable(false),
    tweets: ko.observableArray(),
    sortBy: ko.observable(),
    sortOrder: ko.observable('desc'),

    flipSortOrder: function() {
      this.sortOrder(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    },
    sortTweets: function(by) {
      if(by === this.sortBy()) {
        this.flipSortOrder();
      } else {
        this.sortOrder('desc');
        this.sortBy(by);
      }
    },
    fetchNew: function() {
      this.loading(true);

      adaptiveLab.fetchNewTweets()
        .done(function(response) {
          var filtered = filter.filterTweets(response);
          if(!filtered.length) {
            noty({text: "No new tweets"});
            return;
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
          viewModel.loading(false);
        });
    }
  };

  viewModel.hasNoTweets = ko.computed(function() {
    return this.tweets().length === 0;
  }, viewModel);

  viewModel.loadButtonText = ko.computed(function() {
    return this.loading() ? 'Loading...' : 'MORE';
  }, viewModel);

  viewModel.sortedTweets = ko.computed(function() {
    var order = this.sortOrder();
    var sortBy = this.sortBy();

    if(!sortBy) {
      return this.tweets();
    }

    if(order === 'asc') {
      return this.tweets().sort(function(t1, t2) {
        return compare(t1[sortBy], t2[sortBy]);
      });
    } else {
      return this.tweets().sort(function(t1, t2) {
        return compare(t2[sortBy], t1[sortBy]);
      });
    }
  }, viewModel);

  var container = $('#container');

  $(function() {
    ko.applyBindings(viewModel, container[0]);
    viewModel.fetchNew();

    container.on('click', 'a.sorting-link', function() {
      var sortBy = $(this).attr('data-sort-by');
      viewModel.sortTweets(sortBy);
    });
  });
});
