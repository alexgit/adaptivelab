define(['vendor/knockout'], function(ko) {

  return function TweetFilter() {
    this.tweets = [];

    this.filterTweets = function(newTweets) {
      var results = [],
        self = this;

      ko.utils.arrayForEach(newTweets, function(newTweet) {
        var found = !!ko.utils.arrayFirst(self.tweets, function(t) {
          return t.id === newTweet.id;
        });

        if(!found) {
          self.tweets.unshift(newTweet);
          results.push(newTweet);
        } else {
          console.log('filtered out duplicate: ' + newTweet);
        }
      });

      return results;
    };
  };

});