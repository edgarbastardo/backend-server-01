import { readFileSync } from 'fs';
/*
import {
  GraphQLDate,
  GraphQLDateTime,
  GraphQLTime
} from 'graphql-iso-date';
*/

import {
  //DateTimeResolver,
  /*
  EmailAddressResolver,
  NegativeFloatResolver,
  NegativeIntResolver,
  NonNegativeFloatResolver,
  NonNegativeIntResolver,
  NonPositiveFloatResolver,
  NonPositiveIntResolver,
  PhoneNumberResolver,
  PositiveFloatResolver,
  PositiveIntResolver,
  PostalCodeResolver,
  UnsignedFloatResolver,
  UnsignedIntResolver,
  URLResolver,
  BigIntResolver,
  LongResolver,
  GUIDResolver,
  HexColorCodeResolver,
  HSLResolver,
  HSLAResolver,
  IPv4Resolver,
  IPv6Resolver,
  ISBNResolver,
  MACResolver,
  PortResolver,
  RGBResolver,
  RGBAResolver,
  USCurrencyResolver,
  */
  JSONResolver,
  //JSONObjectResolver,
} from 'graphql-scalars';
import I18NManager from '../../../../common/managers/I18Manager';

export const typeDefs = readFileSync(`${ __dirname }/root.graphql`, 'utf8');

export const resolvers = {

  /*
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,
  */

  /*
  NonPositiveInt: NonPositiveIntResolver,
  PositiveInt: PositiveIntResolver,
  NonNegativeInt: NonNegativeIntResolver,
  NegativeInt: NegativeIntResolver,
  NonPositiveFloat: NonPositiveFloatResolver,
  PositiveFloat: PositiveFloatResolver,
  NonNegativeFloat: NonNegativeFloatResolver,
  NegativeFloat: NegativeFloatResolver,
  UnsignedFloat: UnsignedFloatResolver,
  UnsignedInt: UnsignedIntResolver,
  BigInt: BigIntResolver,
  Long: LongResolver,

  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
  PhoneNumber: PhoneNumberResolver,
  PostalCode: PostalCodeResolver,

  GUID: GUIDResolver,

  HexColorCode: HexColorCodeResolver,
  HSL: HSLResolver,
  HSLA: HSLAResolver,
  RGB: RGBResolver,
  RGBA: RGBAResolver,

  IPv4: IPv4Resolver,
  IPv6: IPv6Resolver,
  MAC: MACResolver,
  Port: PortResolver,

  ISBN: ISBNResolver,

  USCurrency: USCurrencyResolver,
  */
  JSON: JSONResolver,
  //JSONObject: JSONObjectResolver,

  Query: {

    status: ( obj: any, args : any, context: any, info: any ) => {

      const strLanguage = context.Language;

      return { Code: 1, Message: I18NManager.translateSync( strLanguage, "Ok" ) };

    }

  },

  Mutation: {

    status: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      return { Code: 1, Message: I18NManager.translateSync( strLanguage, "Ok" ) };

    }

  }

};
