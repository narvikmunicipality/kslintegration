function VismaXmlDataSource(vismaXmlPath, fileReader, parseXml) {
    return {
        getPersons: async () => {
            let xml = await parseXml(await fileReader(vismaXmlPath))
            let personList = xml.personsXML.person
            let persons = []

            for (let person_i = 0; person_i < personList.length; person_i++) {
                const xmlPerson = personList[person_i];
                
                persons.push({
                    employeeId: xmlPerson.employments.employment.employeeId._text,
                    familyName: xmlPerson.familyName._text,
                    givenName: xmlPerson.givenName._text,
                    ssn: xmlPerson.ssn._text,
                })
            }

            return persons
        }
    }
}

module.exports = VismaXmlDataSource