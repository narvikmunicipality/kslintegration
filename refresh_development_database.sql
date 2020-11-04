-- Assuming the database name is kslintegration, running this will destroy the
-- existing development database and then create a copy the production database
-- as the new development database.

-- IMPORTANT: It's advised to add a "_dev" suffix, since this will be catched 
--            by the build script to prevent creating a production release 
--            that points to a development database.


/**
-- Recreate tables from scratch
-----------------------------------------------------------------------------------------------------------------------
USE [kslintegration]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Person](
	[InternalId] [int] IDENTITY(1,1) NOT NULL,
	[SocialSecurityNumber] [nvarchar](max) NOT NULL,
	[FirstName] [nvarchar](max) NOT NULL,
	[LastName] [nvarchar](max) NOT NULL,
	[Email] [nvarchar](max) NOT NULL,
	[FromDate] [datetime] NOT NULL,
	[ToDate] [datetime] NULL,
	[NewVersionId] [int] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Person] ADD  CONSTRAINT [DF_Person_FromDate]  DEFAULT (getdate()) FOR [FromDate]
GO
-----------------------------------------------------------------------------------------------------------------------
USE [kslintegration]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[EmployeePosition](
	[InternalId] [int] IDENTITY(1,1) NOT NULL,
	[OrganisationId] [nvarchar](max) NOT NULL,
	[SocialSecurityNumber] [nvarchar](max) NOT NULL,
	[JobTitle] [nvarchar](max) NOT NULL,
	[PrimaryPosition] [varchar](5) NOT NULL,
	[FromDate] [datetime] NOT NULL,
	[ToDate] [datetime] NULL,
	[NewVersionId] [int] NULL,
	[ManagerPosition] [varchar](5) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[EmployeePosition] ADD  CONSTRAINT [DF_EmployeePosition_FromDate]  DEFAULT (getdate()) FOR [FromDate]
GO

ALTER TABLE [dbo].[EmployeePosition] ADD  DEFAULT ('false') FOR [ManagerPosition]
GO
-----------------------------------------------------------------------------------------------------------------------
USE [kslintegration]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Organisation](
	[InternalId] [int] IDENTITY(1,1) NOT NULL,
	[OrganisationId] [nvarchar](max) NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[FromDate] [datetime] NOT NULL,
	[ToDate] [datetime] NULL,
	[NewVersionId] [int] NULL,
	[ParentId] [nvarchar](max) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Organisation] ADD  CONSTRAINT [DF_Organisation_FromDate]  DEFAULT (getdate()) FOR [FromDate]
GO

ALTER TABLE [dbo].[Organisation] ADD  DEFAULT ('') FOR [ParentId]
GO
-----------------------------------------------------------------------------------------------------------------------
*/


DROP DATABASE IF EXISTS kslintegration_dev;
CREATE DATABASE kslintegration_dev;
USE kslintegration_dev;
CREATE USER kslintegration FROM LOGIN kslintegration;
EXEC sp_addrolemember 'db_owner', 'kslintegration';
SELECT * INTO kslintegration_dev.dbo.EmployeePosition FROM kslintegration.dbo.EmployeePosition;
SELECT * INTO kslintegration_dev.dbo.Organisation FROM kslintegration.dbo.Organisation;
SELECT * INTO kslintegration_dev.dbo.Person FROM kslintegration.dbo.Person;
ALTER TABLE kslintegration_dev.dbo.EmployeePosition ADD CONSTRAINT DF_EmployeePosition_FromDate  DEFAULT (getdate()) FOR FromDate
ALTER TABLE kslintegration_dev.dbo.EmployeePosition ADD DEFAULT ('false') FOR ManagerPosition
ALTER TABLE kslintegration_dev.dbo.Organisation ADD CONSTRAINT DF_Organisation_FromDate  DEFAULT (getdate()) FOR FromDate
ALTER TABLE kslintegration_dev.dbo.Organisation ADD DEFAULT ('') FOR ParentId
ALTER TABLE kslintegration_dev.dbo.Person ADD CONSTRAINT DF_Person_FromDate  DEFAULT (getdate()) FOR FromDate