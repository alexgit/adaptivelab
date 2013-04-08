define(function() {

  return function TweetFilter() {
    var seen = {};

    this.filterTweets = function(newTweets) {
      var results = [];
      for(var i = 0, j = newTweets.length; i < j; i++) {
        if(!(newTweets[i].id in seen)) {
          seen[newTweets[i].id] = true;
          results.push(newTweets[i]);
        }
      }

      return results;
    };
  };

});