describe("i18n spec suite", function() {

	beforeEach(function() {
		module('localization', function(localizeProvider) {
			localizeProvider.language = 'qqx';
			localizeProvider.resourceUrl = '/i18n/locale-<>.js';
		});
	});
	beforeEach(inject(function($httpBackend) {
		$httpBackend.whenGET('/i18n/locale-qqx.js').respond({msg: 'Foo bar', msgwithparam: 'Foo $1 baz $2', pluralizedmsg: '$1 {{PLURAL:$1|one=foo|few=foos|other=fooos}}'});
		$httpBackend.whenGET('/i18n/locale-alternate.js').respond({});
		$httpBackend.whenGET('/i18n/locale-default.js').respond({});
		//$httpBackend.whenGET(new RegExp('/i18n/resources-locale_[a-zA-Z-]*.js')).respond({});
	}));

	afterEach(inject(function($httpBackend) {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	}));

	describe("Resource management specs", function() {

		it('should properly load another resource file', inject(function($httpBackend, localize) {
			$httpBackend.expectGET('/i18n/locale-alternate.js');
			localize.setLanguage('alternate');
			$httpBackend.flush();
		}));

	});

	describe("Translation specs", function() {

		beforeEach(inject(function($httpBackend, localize) {
			// ensure resources are loaded prior to running tests
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
