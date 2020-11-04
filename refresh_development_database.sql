-- Assuming the database name is kslintegration, running this will destroy the
-- existing development database and then create a copy the production database
-- as the new development database.

-- IMPORTANT: It's advised to add a "_dev" suffix, since this will be catched 
--            by the build script to prevent creating a production release 
--            that points to a development database.

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