# KslIntegration

## Quick setup guide
Copy .env.example to .env and fill in values.
Create a database and create tables using SQL in *refresh_development_database.sql*.
Run the buildscript, *build.ps1*, and a zip-file will be created in the publish folder that contains everything needed to start a server.
Additionally a cronjob will be needed to run *worker.js* which will pull data from the HRM datasource and put in the database.

## Development guide
### Overview
The project was developed in VSCode, for debugging or running the project locally the build jobs are as follows:
- KslIntegrationWorker synchronizes from the API's to the database.
- KslIntegrationServer runs the web server for testing locally.
- jasmine runs the test.
nodejs (https://nodejs.org/en/) must be installed; run *build.ps1* to get dependencies installed.

### Source code
*container.js* - configures and connects every component; if you want to write your own data source you'll need to replace the classes the worker uses here.

*EmployeeTaxonomy* and *Venue* are not implemented and will always return "nothing".

### Design decisions
Active Directory was used as the primary source for mail addresses because they're not always correct in HRM; if you want to change this you'd need to write a new class that maps mail addresses to the users SSN and replace it with the current *ActiveDirectoryService* in *container.js:61*.

To change the data source classes you can start at line 82-84 in *container.js*; they contain the setup for the data sources - using the tests should help here while developing a data source.