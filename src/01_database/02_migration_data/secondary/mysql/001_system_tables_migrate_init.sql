-- CREATE SCHEMA IF NOT EXISTS `Test02_DB` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `sysDBMigratedData` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `SystemId` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `FilePath` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `FileName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `FullPathCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `ContentCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Success` tinyint(1) NOT NULL,
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(60) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_sysDBMigratedData_FullPathCheckSum_idx` (`FullPathCheckSum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `sysDBImportedData` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `SystemId` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `FilePath` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `FileName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `FullPathCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `ContentCheckSum` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Success` tinyint(1) NOT NULL,
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(60) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_sysDBImportedData_FullPathCheckSum_idx` (`FullPathCheckSum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
