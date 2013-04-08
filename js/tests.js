require.config({
  paths: {
    'jasmine': 'vendor/jasmine/jasmine',
    'jasmine-html': 'vendor/jasmine/jasmine-html'
  },
  shim: {
    'jasmine': {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    }
  }
});

define(['jasmine', 'jasmine-html', 'tweetfilter'], function(jasmine, jh, TweetFilter) {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 250;

  var htmlReporter = new jh.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  describe('the twitter filter should do it\'s job properly', function() {

    var filter;

    beforeEach(function() {
      filter = new TweetFilter();
    });

    it('should filter out duplicate tweets', function() {
      var firstBatch = [
        { id: 123, message: 'ahoi' },
        { id: 124, message: 'bleh' }
      ];

      filter.filterTweets(firstBatch);

      var secondBatch = [
        { id: 124, message: 'ahoi' },
        { id: 125, message: 'bleh' }
      ];

      var result = filter.filterTweets(secondBatch);

      expect(result.length).toEqual(1);
    });

    it('should return the same number of tweets if no duplicates', function() {
      var firstBatch = [
        { id: 123, message: 'ahoi' },
        { id: 125, message: 'bleh' },
        { id: 126, message: 'asdfasdf' }
      ];

      filter.filterTweets(firstBatch);

      var secondBatch = [
        { id: 127, message: 'ahoi' },
        { id: 128, message: 'bleh' },
        { id: 129, message: 'asdfasdf' }
      ];

      var result = filter.filterTweets(secondBatch);

      expect(result.length).toEqual(3);
    });

    it('return an empty array when all are duplicates', function() {
      var firstBatch = [
        { id: 123, message: 'ahoi' },
        { id: 125, message: 'bleh' },
        { id: 126, message: 'asdfasdf' }
      ];

      filter.filterTweets(firstBatch);

      var secondBatch = [
        { id: 123, message: 'ahoi' },
        { id: 125, message: 'bleh' },
        { id: 126, message: 'asdfasdf' }
      ];

      var result = filter.filterTweets(secondBatch);

      expect(result.length).toEqual(0);
    });

  });

  $(function(){
      jasmineEnv.execute();
  });
});