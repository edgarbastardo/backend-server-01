-- Business migration file

/*
CREATE TABLE IF NOT EXISTS `bizExample` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `Name` varchar(75) COLLATE utf8_unicode_ci NOT NULL,
  `Comment` varchar(512) COLLATE utf8_unicode_ci NOT NULL,
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Example table';
*/