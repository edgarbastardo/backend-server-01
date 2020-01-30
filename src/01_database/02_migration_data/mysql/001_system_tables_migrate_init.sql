-- CREATE SCHEMA IF NOT EXISTS `Test02_DB` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `DBMigratedData` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `SystemId` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `FilePath` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `FileName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `FullPathCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `ContentCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Success` tinyint(1) NOT NULL,
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `DBMigratedData_FullPathCheckSum_UNIQUE` (`FullPathCheckSum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `DBImportedData` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `SystemId` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `FilePath` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `FileName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `FullPathCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `ContentCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Success` tinyint(1) NOT NULL,
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `DBImportedData_FullPathCheckSum_UNIQUE` (`FullPathCheckSum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*
  root_binaries
    - persistent
       - category
         - year-month-day-hour
          - username
    - temporal
       - category
         - year-month-day-hour
          - username
*/

CREATE TABLE IF NOT EXISTS `BinaryIndex` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.\n\nAlso is the name of file itself system operating file system',
  `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `AccessKind` tinyint(1) unsigned NOT NULL DEFAULT '2' COMMENT '1=Public, 2=Authenticated, 3=Tag',
  `StorageKind` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Kind of storage\n\n0 = Persistent\n1 = Temporal\n\nPersistent binary never eliminated by system administrator\nTemporal can been deleted by system administrator any moment or for clean startup process',
  `ExpireAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time when expire the binary data, used for StorageKind = 1 (Temporal)',
  `Category` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Category',
  `Hash` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'hash file or field data. \n\nExample: \n\nsha512://iVBORw0KGgoAAAANS...\n\ncrc32://234EF',
  `MimeType` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'file type in the type/subtype (mime type).\n\nExample: \n\nimage/png\n\ntext/plain',
  `Label` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'A title of binary',
  `FilePath` varchar(2048) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Path where is stored the data file in system operating file system\n\nExamples:\n\nbinaries/persistent/2017/10/24/10/administrator@system.net/test/postman/\n\nbinaries/temporal/2017/10/24/10/administrator@system.net/test/postman/\n\nbinaries/public/2017/10/24/12/administrator@system.net/test/postman/\n',
  `FileName` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Original file name',
  `FileExtension` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Detected file extension',
  `FileSize` bigint(30) NOT NULL DEFAULT '0' COMMENT 'File size in bytes',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `System` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of system to uploaded the binary',
  `Context` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Context info generally used with persistent session to write the logger user name in the foreign system',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `DenyTagAccess` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users split by , and sourrounded by # to deny access this binary\n\nExample:\n\n#group01#, #manager01@system.net#, #exporter#\n\n* = Deny any access to this record\nnull = no access defined',
  `AllowTagAccess` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users split by , and sourrounded by # to allow access this binary\n\nExample:\n\n#group01#, #manager01@system.net#, #exporter#\n\n* = Any access to this record\nnull = no access defined',
  `ShareCode` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Allow to public share the binary',
  `Owner` varchar(2048) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Owners of this binary generally the user uploader for this binary. Can be a list of name/id of groups or users split by , and sourrounded by #',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ProcessNeeded` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=No, 1=Yes',
  `ProcessStartedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'When started to work',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `BinaryIndex_ShortId` (`ShortId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the index for saved binary (files) entities ( .JPG , .PNG , .PDF) on system operating file system.';

CREATE TABLE IF NOT EXISTS `Person` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `ImageId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Reference the ID of binary in table BinaryIndex',
  `Title` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Mr, Ms, Dr',
  `FirstName` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `LastName` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL,
  `NickName` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Abbreviation` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Abbreviation of firstname and lastname',
  `Gender` smallint(6) DEFAULT NULL COMMENT '0 = Famale\n1 = Male',
  `BirthDate` date DEFAULT NULL,
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Main phone of person',
  `EMail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Main email of person',
  `Address` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Main address of person',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Person_ShortId` (`ShortId`),
  KEY `Person_Phone_idx` (`Phone`),
  KEY `Person_EMail_idx` (`EMail`),
  KEY `FK_Person_ImageId_From_BinaryIndex_Id_idx` (`ImageId`),
  CONSTRAINT `FK_Person_ImageId_From_BinaryIndex_Id` FOREIGN KEY (`ImageId`) REFERENCES `BinaryIndex` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store information Person';

CREATE TABLE IF NOT EXISTS `UserGroup` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Name` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of group. Must be unique will can apply a restriction (Unique).',
  `Role` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name of roles. Example:\n\n #Roles01#, #Roles02#',
  `DenyTagAccess` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users to deny access this group\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated first with the allow groups counterpart\n\n* Indicate nobody access to this group from outside server',
  `AllowTagAccess` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users to allow access this group\n\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated later with the deny groups counterpart\n\n* = Any access to this group if not * or listed in DenyTagAccess',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UserGroup_ShortId` (`ShortId`),
  UNIQUE KEY `UserGroup_Name_UNIQUE` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores all groups system users.';

CREATE TABLE IF NOT EXISTS `User` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `GroupId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign Key to the Id field of UserGroup table. The group to which the user belongs.',
  `PersonId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign Key to the Id field of Person table. The person to which the user belongs.',
  `ForceChangePassword` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Force to change password the next login.\n\n1 = Force the change password the next login.\n0 = Not force the change password the next login.',
  `ChangePasswordEvery` smallint(6) NOT NULL DEFAULT 0 COMMENT 'Change password every N days.',
  `SessionsLimit` smallint(6) NOT NULL DEFAULT '0' COMMENT '0 = No limit session, >= 1 Only the number of sessions allowed',
  `Avatar` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Reference the ID of binary in table BinaryIndex, Or URI from extrnal service avatar image',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name (login). Must be unique will can apply a restriction (Unique).',
  `Password` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'User password.',
  `PasswordSetAt` varchar(30) NOT NULL COMMENT 'Last Date and time password set, default the same when created.',
  `Role` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name of roles, no prefix #Role01# to allow, and -#Role03# to deny.\n\nExample:\n\n #Roles01#, #Roles02#, -#Roles03#',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `User_ShortId` (`ShortId`),
  UNIQUE KEY `User_Name_UNIQUE` (`Name`),
  KEY `FK_User_GroupId_From_UserGroup_Id_idx` (`GroupId`),
  KEY `FK_User_PersonId_From_Person_Id_idx` (`PersonId`),
  CONSTRAINT `FK_User_GroupId_From_UserGroup_Id` FOREIGN KEY (`GroupId`) REFERENCES `UserGroup` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_User_PersonId_From_Person_Id` FOREIGN KEY (`PersonId`) REFERENCES `Person` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores all Users.';

CREATE TABLE IF NOT EXISTS `UserRecover` (
  `Id` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier UUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key to the Id field of User table.',
  `Token` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Recover token',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_RecoverToken_UserId_idx` (`UserId`),
  CONSTRAINT `FK_RecoverToken_UserId_From_User_Id` FOREIGN KEY (`UserId`) REFERENCES `User` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the recover token created by system/security/sendRecoverToken service, expire on 30 min atfer createdAt date/time';

CREATE TABLE IF NOT EXISTS `UserSignup` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `Kind` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Depend of type of user to activate',
  `ClientId` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Client id code',
  `Token` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Activation token',
  `Status` smallint(6) NOT NULL COMMENT '0 = Waiting activation\n25 = Manual activation\n50 = Activated',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name (username).',
  `FirstName` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `LastName` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `EMail` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Main email of person',
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Main phone of person',
  `Password` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'User password.',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the user auto signup table information';

CREATE TABLE IF NOT EXISTS `UserDevice` (
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign Key to the Id field of User table.',
  `Token` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Registration token from extenal services like one signal push',
  `Device` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Generic device info',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`UserId`,`Token`),
  KEY `FK_SessionStatus_Token_idx` (`Token`),
  CONSTRAINT `FK_UserDevice_UserId_User_Id` FOREIGN KEY (`UserId`) REFERENCES `User` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the device register by the user.';

CREATE TABLE IF NOT EXISTS `UserSessionStatus` (
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign Key to the Id field of User table.',
  `Token` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Authentication token',
  `UserGroupId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign Key to the Id field of UserGroup table.',
  `BinaryDataToken` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Binary token, used in get petition pass to url, in binary data',
  `SocketToken` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Web socket authentication token, pass on connect event to websocket server',
  `ClientId` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Exclusive id string to indeitify the client kind',
  `SourceIPAddress` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Source network IP address',
  `Role` text COLLATE utf8_unicode_ci NOT NULL COMMENT 'Role efective taken from Group.Role, User.Role and merged on list',
  `UserName` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name (login). Must be unique will can apply a restriction (Unique).',
  `ExpireKind` tinyint(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0' COMMENT 'Expire kind 0 = Calculated from UpdatedAt, 1 = Calculated from CreatedAt, 2 = Calculated from ExpireOn',
  `ExpireOn` varchar(30) COLLATE utf8_unicode_ci NOT NULL DEFAULT '60' COMMENT 'Expire time on minutes or defined date time YYYY-MM-DDTHH:MM:SS +z',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user updated the row',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT'Date and time of last update to the row.',
  `LoggedOutBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user that logged out the session.',
  `LoggedOutAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Indicates the date and time of logout, to be different from NULL, it is assumed that the session which represents the row is no longer valid.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`UserId`,`Token`),
  KEY `FK_SessionStatus_Token_idx` (`Token`),
  UNIQUE KEY `FK_SessionStatus_BinaryDataToken_idx` (`BinaryDataToken`),
  UNIQUE KEY `FK_SessionStatus_SocketToken_idx` (`SocketToken`),
  CONSTRAINT `FK_SessionStatus_UserId_User_Id` FOREIGN KEY (`UserId`) REFERENCES `User` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_SessionStatus_UserGroupId_UserGroup_Id` FOREIGN KEY (`UserGroupId`) REFERENCES `UserGroup` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the user session if it alive or not.';

CREATE TABLE IF NOT EXISTS `UserSessionPersistent` (
  `Id` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier UUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key to the Id field of User table. Partially identifies the restriction to which the user belongs.',
  `Token` varchar(175) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Clear or crypted authentication token. Must by start with p.',
  `BinaryDataToken` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Binary token, used in get petition pass to url, in binary data',
  `SocketToken` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Web socket authentication token, pass on connect event to websocket server',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row.',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExpireAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Expiration date and time of the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_SessionPersistent_UserId_idx` (`UserId`),
  UNIQUE KEY `FK_SessionPersistent_Token_idx` (`Token`),
  CONSTRAINT `FK_SessionPersistent_UserId_From_User_Id` FOREIGN KEY (`UserId`) REFERENCES `User` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the persistent user session for access with only session token and not with username/password';

CREATE TABLE IF NOT EXISTS `Route` (
  `Id` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Id from path, generated with xxhash',
  `AccessKind` tinyint(3) unsigned DEFAULT NULL COMMENT '1=Public, 2=Authenticated, 3=Role',
  `RequestKind` tinyint(3) unsigned DEFAULT NULL COMMENT '0=None, 1=Get, 2=Post, 3=Put, 4=Delete',
  `Path` varchar(2048) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Route path',
  `AllowTagAccess` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Default access tag list split by , and sourrounded by # to allow access this route\nExample:\n#Administrator#,#Asistant_2#',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Description` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A description of the route and what supposed to do',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row.',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store all routes in the backend';

CREATE TABLE IF NOT EXISTS `Role` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Name` varchar(120) COLLATE utf8_unicode_ci NOT NULL,
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row.',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` text COLLATE utf8_unicode_ci COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Role_ShortId` (`ShortId`),
  UNIQUE KEY `Role_Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store all role definition';

CREATE TABLE IF NOT EXISTS `RoleHasRoute` (
  `RoleId` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `RouteId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  PRIMARY KEY (`RoleId`,`RouteId`),
  KEY `RoleHasRoute_RoleId` (`RoleId`),
  KEY `RoleHasRoute_RouteId` (`RouteId`),
  CONSTRAINT `RoleHasRoute_RoleId_From_Role_Id` FOREIGN KEY (`RoleId`) REFERENCES `Role` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `RoleHasRoute_RouteId_From_Route_Id` FOREIGN KEY (`RouteId`) REFERENCES `Route` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store relations between role and route';

-- CREATE TABLE IF NOT EXISTS `ApiKey` (
--   `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'UUID',
--   `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
--   `Application` varchar(175) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Store the system associated or use this key. Use * for any system\n\nExample:\n\nWebFrontend\nBackend\n',
--   `Provider` varchar(175) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Store the provider name.\n\nExample:\n\nGoogle\nAmazon\nDigitalOcean\n\n\n',
--   `Service` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Store the type of key.\n\nExample:\nMap\nGeocode\n',
--   `Account` varchar(175) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Store account on more cases the email.\n\nExample:\nsirlordt@gmail.com\n',
--   `RequestType` smallint(6) NOT NULL COMMENT '1 = GET\n2 = POST\n3 = PUT\n5 = DELETE\n6 = PATCH\n6 = Other?',
--   `URI` varchar(2048) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Domain \n\nExample:\nhttps://onesignal.com/api/v1/notifications',
--   `KeyName01` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Example: key01',
--   `KeyValue01` varchar(512) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Example: xxxxx1',
--   `KeyName02` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Example: key02',
--   `KeyValue02` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Example: xxxxx2',
--   `KeyName03` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Example: key03',
--   `KeyValue03` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Example: xxxxx3',
--   `DenyTagAccess` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users to deny access this api key\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated first with the allow groups counterpart\n\n* Indicate nobody access to this api key from outside server',
--   `AllowTagAccess` varchar(2048) COLLATE utf8_unicode_ci NOT NULL DEFAULT '*' COMMENT 'List of name/id of groups or users to allow access this api key\n\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated later with the deny groups counterpart\n\n* = Any access to this api key if not * or listed in DenyTagAccess',
--   `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
--   `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
--   `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
--   `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
--   `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
--   `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row.',
--   `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
--   `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
--   PRIMARY KEY (`Id`),
--   UNIQUE KEY `ApiKey_ShortId` (`ShortId`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the api key for use with system.';

CREATE TABLE IF NOT EXISTS `ConfigMetaData` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'UUID gen id',
  `ShortId` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Scope` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Apply to entity, apply to system, group, user.\n\nExample:\n\nsystem\ngroup\nuser\n*',
  `Owner` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Owner form config metadata entry\n\nExample:\n\nSystem.Administrators\n971406fe-2aa5-4cb0-82d8-4c90c090f6cc\n',
  `Category` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Category for this config meta entry\n\nExample:\n\nSystem\nNotifications\nOthers',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Config entry name\n\nExample:\n\nsystem.show.DiagnosticTools.Groups\nsystem.show.DiagnosticTools.users\nsystem.deny.RecoverPassword.Groups\nsystem.deny.RecoverPassword.users\nsystem.default.StartTaskAccess\nsystem.default.DBCommandAccess\nsystem.default.InstantMessageAccess\nsystem.audited.Tables\nsystem.StrengthPasswordParameters\n\nmodule.MaximumPersistentBinarySize\nmodule.MaximumTemporalBinarySize\nmodule.BinarysBasePath\nmodule.BinarysPersistentPathFormat\nmodule.BinarysTemporalPathFormat\n\nuser.ConfigName\n\ngroup.ConfigName\n\n',
  `Label` varchar(200) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Label showed in ui\n\nExample:\n\nShow diagnostic tools for this groups names\nShow diagnostic tools for this users names\n',
  `Description` varchar(512) COLLATE utf8_unicode_ci NOT NULL COMMENT 'General description del config entry general used in UI\n\nExample: \n\nShow diagnostic tools for this groups names enclosed in ## and separated by ; example ##my_group1##;##my_group2##\nShow diagnostic tools for this users names enclosed in ## and separated by ; example ##my_user1##;##my_user2##',
  `ListOrder` smallint(6) NOT NULL DEFAULT '0' COMMENT 'Indicate the list order\n\nUses full for UI screen in logical order for final user.',
  `Hidden` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Not hidden\n1 = Hidden, Never listed in search or list result services',
  `Private` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Not private\n1 = Private, Only fo use in the backend never writed or readed using services',
  `Default` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Default value for this config',
  `DefaultLabel` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Indicates the meaning of a value\n\nExample:\nWhen Default = 0, DefaultLabel = Deny\n\nWhen Default = 1, DefaultLabel = Allow\n',
  `DenyTagAccessR` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users to deny read access this config entry\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated first with the allow read counterpart\n\n* Indicate nobody access to this config entry from outside server',
  `DenyTagAccessW` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of name/id of groups or users to deny write access this config entry\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated first with the allow write counterpart\n\n* Indicate nobody access to this config entry from outside server',
  `AllowTagAccessR` varchar(2048) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0' COMMENT 'List of name/id of groups or users to allow read access this config entry\n\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated later with the deny read counterpart\n\n* = Any access to this config entry if not * or listed in DenyTagAccessR',
  `AllowTagAccessW` varchar(2048) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0' COMMENT 'List of name/id of groups or users to allow write access this config entry\n\nExample:\n\n#group01#, #sellers#, #exporter#\n\nThis field is evaluated later with the deny write counterpart\n\n* = Any access to this config entry if not * or listed in DenyTagAccessW',
  -- The next fields moved to extra data field in json format
  -- `Type` varchar(25) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Type of config value\n\nExample posible values:\n\nstring\ninteger \nfloat\ndate\ntime \ndateTime ',
  -- `SubType` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Sub type of config value\n\nExample posible values:\n\nsingleline\nmultiline\nlist\nlistEditable\nlistMultiselect\nlistEditableMultiselect\nsctruct/json\nsctruct/xml\n\n',
  -- `Values` varchar(2048) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Posible values for this config usefull for subtype = list* and struct/*\n\nSyntax {functionName} before of { is prefix value and after } is postfix value\n\nfunction://##{fillWithuserNames}##\nfunction://##{fillWithGroupNames}##\nfunction://##{fillWithTableNames}##\n',
  -- `Required` smallint(6) NOT NULL COMMENT '0 = Not required\n1 = Required\n',
  -- `Minimal` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Minimal allowed value, usefull for type integer, float',
  -- `Maximal` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Maximal allowed value, usefull for type integer, float',
  -- `MinLength` int(11) DEFAULT NULL COMMENT 'Minimal length',
  -- `MaxLength` int(11) DEFAULT NULL COMMENT 'Maximal length',
  -- `MinLowerCase` int(11) DEFAULT NULL COMMENT 'Minimal lowercase letters from a to z',
  -- `MaxLowerCase` int(11) DEFAULT NULL COMMENT 'Maximal lowercase letters from a to z',
  -- `MinUpperCase` int(11) DEFAULT NULL COMMENT 'Minimal lowercase letters from A to Z',
  -- `MaxUpperCase` int(11) DEFAULT NULL COMMENT 'Not showed in list services\n\n0 = No\n1 = Yes',
  -- `MinDigit` int(11) DEFAULT NULL COMMENT 'Minimal digit from 0 to 9',
  -- `MaxDigit` int(11) DEFAULT NULL COMMENT 'Maximal digit from 0 to 9',
  -- `MinSymbol` int(11) DEFAULT NULL COMMENT 'Minimal symbols like %&/() etc.\n\n',
  -- `MaxSymbol` int(11) DEFAULT NULL COMMENT 'Maximal symbols like %&/() etc.\n',
  -- `Format` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Format preset\n\nformat://email\nformat://url\nformat://ftpurl\nformat://httpurl\nformat://timezoneid\nformat://datetime:F:yyyy-MM-dd-hh-mm-ss\nformat://ip\nformat://ipv4\nformat://ipv6\nformat://json\nformat://xml\nregexp://\n',
  -- `FrontendInfo` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Frotend information used by uid\n\nExample:\n\n{ "webzk" = { "width" : "100px", "lines" : "5", "mask" : "0000-00-00 00:00:00" }, "android"={ "width="20px", }, "ios"={ "width": "50px" } }\n\nwhere 0000-00-00 00:00:00 is preset for ui\n\n0000-00-00 00:00:00 Javascript/html textbox validation format / JQuery Mask plugin https://igorescobar.github.io/jQuery-Mask-Plugin/docs.html',
  -- `DenyRead` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of users id or users names separated by ; use * for all.\n\nExample:\n\n874e97ee-81bb-463d-a651-1c2996706e63;manager@business.net;Business.Managers;System.Administrators',
  -- `DenyWrite` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'List of users id or users names separated by ; use * for all.\n\nExample:\n\n874e97ee-81bb-463d-a651-1c2996706e63;manager@business.net;Business.Managers;System.Administrators',
  -- `AllowRead` varchar(512) COLLATE utf8_unicode_ci NOT NULL COMMENT 'List of users id or users names separated by ; use * for all. Use @ for only field value in owner from table ConfigValueData \n\nExample:\n\n874e97ee-81bb-463d-a651-1c2996706e63;manager@business.net;Business.Managers;System.Administrators',
  -- `AllowWrite` varchar(512) COLLATE utf8_unicode_ci NOT NULL COMMENT 'List of users id or users names separated by ; use * for all. Use @ for only field value in owner from table ConfigValueData \n\nExample:\n\n874e97ee-81bb-463d-a651-1c2996706e63;manager@business.net;Business.Managers;System.Administrators',
  `Example` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Example data',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Commentary configuration data input , usually created from ui.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `ConfigMetaData_ShortId` (`ShortId`),
  UNIQUE KEY `ConfigMetaData_Name_UNIQUE` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store information about config meta data.';

CREATE TABLE IF NOT EXISTS `ConfigValueData` (
  `ConfigMetaDataId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'foreign key to Id field on table ConfigMetaData. that indicates that the shares belong config. GUID.',
  `Owner` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Owner form config value entry\n\nExample:\n\nSystem.Administrators\n971406fe-2aa5-4cb0-82d8-4c90c090f6cc\n',
  `Value` longtext COLLATE utf8_unicode_ci NOT NULL COMMENT 'Value from config',
  `ValueLabel` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Indicates the meaning of a value\n\nExample:\nWhen Value = 0, ValueLabel = Deny\n\nWhen Value = 1, ValueLabel = Allow\n',
  `Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`ConfigMetaDataId`,`Owner`),
  CONSTRAINT `FK_ConfigValueData_ConfigMetaDataId_From_ConfigMetaData_Id` FOREIGN KEY (`ConfigMetaDataId`) REFERENCES `ConfigMetaData` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
