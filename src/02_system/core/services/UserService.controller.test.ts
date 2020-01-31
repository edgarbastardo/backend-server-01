import Validator from 'validatorjs';
import SystemUtilities from "../../common/SystemUtilities";

const debug = require( 'debug' )( 'UserService.constroller.test' );

function customRegister( validator: any, logger: any ) {

  Validator.register(
                      'dummy',
                      function( value: any, requirement, attribute ) {

                        return value.match( /(\d{1,3}-)?(\d{3}-){2}\d{4}/g ); ///^\d{3}-\d{3}-\d{4}$/ );

                      },
                      'The :attribute dummy is not in the format XXX-XXX-XXXX.'
                    );

}

test( `Test validatorjs library 001`, async () => {

  let data = {
               Name: 'myuser@gmail.com#_',
               EMail: 'myuser01@gmail.com,myuser02@gmail.com',
               Phone: '1-305-776-8899,1-598-776-8989',
               FirstName: "José Ráfael",
               LastName: "Montaño Gómez",
               Test: '1-305-776-8888'
             };

  //See https://www.npmjs.com/package/validatorjs for more rules
  let rules = {
                Name: [ 'required', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                EMail: 'required|emailList', //<-- emailList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                Phone: 'present|phoneUSList', //<-- phoneUSList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                FirstName: [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                LastName:  [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                Test: 'required|dummy'
              };

  let validator = SystemUtilities.createCustomValidatorSync( data,
                                                             rules,
                                                             customRegister,
                                                             null );

  const bResult = validator.passes();

  //let debugMark = debug.extend( '5EE41A799E09' );
  //debugMark( "%O", validation.errors.all() );
  //console.log( validation.errors.all() );
  const x = validator.errors.all();

  //validation.fails(); // false
  expect( bResult ).toBe( true );

})
