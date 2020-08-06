CREATE TABLE IF NOT EXISTS `bizDeliveryZone` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `Kind` smallint(6) NOT NULL DEFAULT '0' COMMENT '0 = On demand, 1 = Fixed place, 2 = Route',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of Delivery Zone',
  `Distance` decimal(10,2)  NOT NULL DEFAULT '0.00' COMMENT 'Maximun distance of delivery',
  `Quantity` smallint(6) NOT NULL DEFAULT '0' COMMENT 'Quantity maximun of delivery',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_bizDeliveryZone_Name_UNIQUE_idx` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores delivery zone and rules.';

CREATE TABLE IF NOT EXISTS `bizEstablishment` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `DeliveryZoneId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Delivery zone associated with the Establisment.',
  `Kind` smallint(6) NOT NULL DEFAULT '0' COMMENT '0 = On demand, 1 = Fixed place, 2 = Route',
  `Name` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of establishment',
  `Address` varchar(512) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Physical address of establishment',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Longitude coordinate.',
  `EMail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Email of establisment',
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Phone of establisment',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_bizEstablishment_Name_UNIQUE_idx` (`Name`),
  KEY `FK_bizEstablishment_DeliveryZoneId_From_bizDeliveryZone_Id_idx` (`DeliveryZoneId`),
  CONSTRAINT `FK_bizEstablishment_DeliveryZoneId_From_bizDeliveryZone_Id` FOREIGN KEY (`DeliveryZoneId`) REFERENCES `bizDeliveryZone` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores establishment.';

CREATE TABLE IF NOT EXISTS `bizOrigin` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table sysUser',
  `EstablishmentId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizEstablisment',
  `Address` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Physical address',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Longitude coordinate.',
  `Name` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of customer/establisment',
  `EMail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Email of customer/establisment',
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Phone of customer/establisment',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizOrigin_UserId_From_bizUser_Id_idx` (`UserId`),
  KEY `FK_bizOrigin_EstablishmentId_From_bizEstablishment_Id_idx` (`EstablishmentId`),
  CONSTRAINT `FK_bizOrigin_UserId_From_bizUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizOrigin_EstablishmentId_From_bizEstablishment_Id` FOREIGN KEY (`EstablishmentId`) REFERENCES `bizEstablishment` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of origin point.';

CREATE TABLE IF NOT EXISTS `bizDestination` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table sysUser',
  `EstablishmentId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizEstablisment',
  `Address` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Physical address',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Longitude coordinate.',
  `Name` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of customer/establisment',
  `EMail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Email of customer/establisment',
  `Phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Phone of customer/establisment',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDestination_UserId_From_bizUser_Id_idx` (`UserId`),
  KEY `FK_bizDestination_EstablishmentId_From_bizEstablishment_Id_idx` (`EstablishmentId`),
  CONSTRAINT `FK_bizDestination_UserId_From_bizUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDestination_EstaId_From_bizEstablishment_Id` FOREIGN KEY (`EstablishmentId`) REFERENCES `bizEstablishment` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of destination point.';

CREATE TABLE IF NOT EXISTS `bizDelivery` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `OriginId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizOrigin',
  `DestinationId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizDestination',
  `DriverId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table sysUser',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `DisabledBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user disabled the row',
  `DisabledAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Disable Date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDelivery_OriginId_From_bizOrigin_Id_idx` (`OriginId`),
  KEY `FK_bizDelivery_DestinationId_From_bizDestination_Id_idx` (`DestinationId`),
  KEY `FK_bizDelivery_DriverId_From_sysUser_Id_idx` (`DriverId`),
  CONSTRAINT `FK_bizDelivery_OriginId_From_bizOrigin_Id` FOREIGN KEY (`OriginId`) REFERENCES `bizOrigin` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDelivery_DestinationId_From_bizDestination_Id` FOREIGN KEY (`DestinationId`) REFERENCES `bizDestination` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDelivery_DriverId_From_sysUser_Id` FOREIGN KEY (`DriverId`) REFERENCES `sysUser` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of delivery.';

CREATE TABLE IF NOT EXISTS `bizDeliveryStatus` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `DeliveryId` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Foreign key from table bizDelivery',
  `Status` smallint(6) NOT NULL DEFAULT '0' COMMENT 'Status step of delivery',
  `Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDelivery_DeliveryId_From_bizDelivery_Id_idx` (`DeliveryId`),
  CONSTRAINT `FK_bizDelivery_DeliveryId_From_bizDelivery_Id` FOREIGN KEY (`DeliveryId`) REFERENCES `bizDelivery` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the delivery status.';

CREATE TABLE IF NOT EXISTS `bizEstablishmentInUserGroup` (
  `UserGroupId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUserGroup',
  `EstablishmentId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizEstablishment',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`UserGroupId`,`EstablishmentId`),
  KEY `FK_bizEstaInUserGroup_UserGroupId_From_sysUserGroup_Id_idx` (`UserGroupId`),
  KEY `FK_bizEstaInUserGroup_EstaId_From_bizEstablishment_Id_idx` (`EstablishmentId`),
  CONSTRAINT `FK_bizEstaInUserGroup_UserGroupId_From_sysUserGroup_Id` FOREIGN KEY (`UserGroupId`) REFERENCES `sysUserGroup` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_bizEstaInUserGroup_EstablishmentId_From_bizEstablishment_Id` FOREIGN KEY (`EstablishmentId`) REFERENCES `bizEstablishment` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of stablisment and user group.';

CREATE TABLE `bizDriverInDeliveryZone` (
  `DeliveryZoneId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizDeliveryZone',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUser',
  `AtDate` date NOT NULL COMMENT 'Indicate the date for delivery zone',
  `LockByRole` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Indicate the role allowed to change',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date updated of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`DeliveryZoneId`,`UserId`,`AtDate`),
  KEY `FK_bizDriInDeliveryZone_DeliveryZoneId_From_sysUser_Id_idx` (`DeliveryZoneId`),
  KEY `FK_bizDriInDeliveryZone_UserId_From_bizEstablishment_Id_idx` (`UserId`),
  CONSTRAINT `FK_bizDriInDeliveryZone_DeliveryZoneId_From_bizDeliveryZone_Id` FOREIGN KEY (`DeliveryZoneId`) REFERENCES `bizDeliveryZone` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_bizDriInDeliveryZone_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of driver delivery zone.';

CREATE TABLE IF NOT EXISTS `bizDriverStatus` (
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUser',
  `AtDate` date NOT NULL date NOT NULL COMMENT 'Indicate the date for delivery zone',
  `Status` smallint(6) NOT NULL DEFAULT '0' COMMENT 'Status id of the driver',
  `Description` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Status text of the driver',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `UpdatedBy` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.',
  `UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`UserId`,`AtDate`),
  CONSTRAINT `FK_bizDriverStatus_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of driver status.';

CREATE TABLE IF NOT EXISTS `bizDriverPosition` (
  `Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.',
  `UserId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUser',
  `ShortToken` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table sysUserSessionStatus on field ShortToken. No Database foreign key cascade update or delete',
  `Accuracy` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Accuracy parameter.',
  `Latitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Latitude coordinate.',
  `Longitude` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Longitude coordinate.',
  `Altitude` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Altitude position.',
  `Speed` varchar(40) COLLATE utf8_unicode_ci NOT NULL  COMMENT 'Speed of movement',
  `Status` smallint NOT NULL COMMENT '0 = offline. Data/Wifi off saved to local mobile database in the device and later uploaded to backend, 1 = online. Full data connectivity send to backend immediately',
  `CreatedBy` varchar(150) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.',
  `CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.',
  `ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format',
  PRIMARY KEY (`Id`),
  KEY `FK_bizDriverPosition_UserId_From_bizEstablishment_Id_idx` (`UserId`),
  KEY `FK_bizDriverPosition_Token_From_sysUserSessionStatus_Token_idx` (`ShortToken`),
  CONSTRAINT `FK_bizDriverPosition_UserId_From_sysUser_Id` FOREIGN KEY (`UserId`) REFERENCES `sysUser` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store the info of driver position.';
