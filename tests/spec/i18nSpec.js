describe("i18n spec suite", function() {

	beforeEach(function() {
		module('localization');
	});
	beforeEach(inject(function($httpBackend) {
		$httpBackend.when('GET', '/i18n/resources-locale_qqx.js').respond({msg: 'Foo bar', msgwithparam: 'Foo $1 baz $2', pluralizedmsg: '$1 {{PLURAL:$1|one=foo|few=foos|other=fooos}}'});
		$httpBackend.when('GET', '/i18n/resources-locale_default.js').respond({});
		$httpBackend.when('GET', '/i18n/resources-locale_cs-CZ.js').respond({});
	}));

	afterEach(inject(function($httpBackend) {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	}));

	describe("Resource management specs", function() {

		it('should properly load the respective resource file', inject(function($httpBackend, localize) {
			$httpBackend.expectGET('/i18n/resources-locale_qqx.js');
			localize.setLanguage('qqx');
			$httpBackend.flush();
		}));

	});

	describe("Translation specs", function() {

		beforeEach(inject(function($httpBackend, localize) {
			localize.setLanguage('qqx');
			$httpBackend.flush();
		}));

		it('should properly translate a basic message', inject(function(localize) {
			expect(localize.getLocalizedString('msg')).toEqual('Foo bar');
		}));

		it('should properly translate a basic message using a filter', inject(function($parse) {
			expect($parse('"msg" | i18n')()).toEqual('Foo bar');
		}));

		it('should properly translate a message with parameters', inject(function(localize) {
			expect(localize.getLocalizedString('msgwithparam', 333, 345)).toEqual('Foo 333 baz 345');
		}));

		it('should properly translate a message with parameters using a filter', inject(function($parse) {
			expect($parse('"msgwithparam" | i18n:333:345')()).toEqual('Foo 333 baz 345');
		}));

		/*
		it('should properly translate a pluralized message', inject(function(localize) {
			expect(localize.getLocalizedParsedString('pluralizedmsg', 1)).toEqual('1 foo');
			expect(localize.getLocalizedParsedString('pluralizedmsg', 3)).toEqual('3 foos');
			expect(localize.getLocalizedParsedString('pluralizedmsg', 333)).toEqual('333 fooos');
		}));

		it('should properly translate a pluralized message using a filter', inject(function($parse) {
			expect($parse('"pluralizedmsg" | i18nparsed:1')()).toEqual('1 foo');
			expect($parse('"pluralizedmsg" | i18nparsed:3')()).toEqual('3 foos');
			expect($parse('"pluralizedmsg" | i18nparsed:333')()).toEqual('333 fooos');
		}));
		*/

	});
});
