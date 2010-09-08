
describe('Fx.Sort', function(){

	it(TESTS.backward.title, function(){

		TESTS.backward.fn();
		waits(2000);
		runs(function(){
			expect(vert.currentOrder).toEqual([4, 3, 2, 1, 0]);
		});

	});

	it(TESTS.reset.title, function(){

		TESTS.reset.fn();
		waits(2000);
		runs(function(){
			expect(vert.currentOrder).toEqual([0, 1, 2, 3, 4]);
		});

	});

	it(TESTS.sort.title, function(){

		TESTS.sort.fn();
		waits(2000);
		runs(function(){
			expect(vert.currentOrder).toEqual([4, 1, 3, 2, 0]);
		});

	});

	it(TESTS.swap.title, function(){

		TESTS.swap.fn();
		waits(2000);
		runs(function(){
			expect(vert.currentOrder).toEqual([0, 1, 3, 2, 4]);
		});

	});

	it(TESTS.reverse.title, function(){

		TESTS.reverse.fn();
		waits(2000);
		runs(function(){
			expect(vert.currentOrder).toEqual([4, 2, 3, 1, 0]);
		});

	});


	it(TESTS.reorder.title, function(){

		TESTS.reorder.fn();
		var vert_order = [];
		vert.elements.each(function(el){
			vert_order.push(+el.get('text').substr(1, 1));
		});
		expect(vert_order).toEqual([4, 2, 3, 1, 0]);
	});

});
