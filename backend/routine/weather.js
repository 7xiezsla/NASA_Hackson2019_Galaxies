const fetch = require('node-fetch');
const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
const mongoConnStr = 'mongodb://seal:seal1234@sealchang.asia:27017/admin';
const mongoConnOpt = { useNewUrlParser: true, useUnifiedTopology: true };

const main = async() => {

    let data;

    await fetch('https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0003-001?Authorization=CWB-98C0377B-92C2-4721-8FDC-A2910E9D7B69&downloadType=WEB&format=JSON')
        .then(res => res.json())
        .then(res => {
            const newdata = res.cwbopendata.location.map(d => {

                let onedata = {
                    _id: d.stationId,
                    longitude: d.lon,
                    latitude: d.lat,
                    locationName: d.locationName
                }

                const schema = new Set(['WDSD', 'TEMP', 'HUMD', 'PRES', '24R', 'H_FX', 'H_UVI', 'D_TX', 'D_TN', 'H_Weather']);

                d.weatherElement.forEach(k => {
                    if (schema.has(k.elementName)) {
                        onedata[k.elementName] = k.elementValue.value;
                    }
                })

                return onedata;
            });

            data = newdata;
        })
        .catch(e => console.log(e));

    const client = await MongoClient.connect(mongoConnStr, mongoConnOpt);

    const db = client.db('nasa');
    const weather = db.collection('weather');

    data.forEach(async(d) => {
        await weather
            .insertOne(d)
            .then(result1 => {})
            .catch(e => {});
    })

    client.close();

}

main();

// const vision = require('@google-cloud/vision');

// // Creates a client
// const client = new vision.ImageAnnotatorClient()

// client.keyFilename = './googleAuth.json'

// async function quickstart() {
//     // Creates a client
//     const client = new vision.ImageAnnotatorClient()

//     client.keyFilename = './googleAuth.json'

//     // Performs label detection on the image file
//     const [result] = await client.labelDetection('./3.jpg');
//     const labels = result.labelAnnotations;
//     console.log('Labels:');
//     labels.forEach(label => console.log(label.description));
// }
// quickstart()