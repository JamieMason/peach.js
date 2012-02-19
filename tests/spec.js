/*global describe,it,expect,pEach*/

(function()
{
  describe("pEach", function()
  {
    it("provides the value and index of each member of the collection in turn", function()
    {
      // precompile
      var iterator = pEach(function(val, i)
          {
            expect(val).toEqual(i + 1);
          });

      // run
      iterator([1, 2, 3]);
    });

    it("loses access to any local variables found in the enclosing scope at compile time", function()
    {
      var someValue = "Hello",
          iterator = pEach(function(val, i, arr)
          {
            expect(val).toEqual(i + 1);
            expect(typeof someValue).toEqual("undefined");
          });

      iterator([1, 2, 3]);
    });

    it("gains access to any local variables passed as arguments at run time", function()
    {
      var someValue = "Hello",
          otherValue = ", is it me you're looking for?",
          iterator = pEach(function(val, i, arr, someValue, otherValue)
          {
            expect(val).toEqual(i + 1);
            expect(someValue).toEqual("Hello");
            expect(otherValue).toEqual(", is it me you're looking for?");
          });

      iterator([1, 2, 3], someValue, otherValue);
    });

    it("returns an object of the values of local variables", function()
    {
      var collection = [1, 2, 3],
          iterator,
          answer = false,
          locals;

      // compile
      iterator = pEach(function(num, index, arr, answer)
      {
        if (num === 2)
        {
          answer = true;
        }
      });

      // run
      locals = iterator(collection, answer);
      expect(locals.answer).toEqual(true);
    });

    it("iterates over Objects as well as Arrays, and ignores the Object's Prototype", function()
    {
      var collection = {
            one: 1,
            two: 2,
            three: 3
          },
          answers = [],
          iterator = pEach(function(val, key, obj, answers)
          {
            answers.push(key);
          });

      collection.constructor.prototype.four = 4;
      iterator(collection, answers);
      expect(answers.join(", ")).toEqual("one, two, three");
      delete collection.constructor.prototype.four;
    });

    it("handles a null properly", function()
    {
      var answers = 0,
          iterator = pEach(function(val, key, obj, answers)
          {
            answers++;
          }),
          locals;

      expect(function () {
        locals = iterator(null, answers);
      }).not.toThrowError();

      expect(locals.answers).toEqual(0);
    });

  });
}());
