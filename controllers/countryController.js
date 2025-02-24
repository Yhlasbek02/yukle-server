const express = require("express");
const router = express.Router();
const path = require("path");
const { country, city } = require("../models/models");
const fs = require("fs");
const JSON_FILE_PATH_ENG = path.join(__dirname, '../english.json');
const file_rus = path.join(__dirname, '../rus.json');
const file_tr = path.join(__dirname, "../tr.json");

router.post('/countries/save', async (req, res) => {
  try {
    const dataE = JSON.parse(fs.readFileSync(JSON_FILE_PATH_ENG, 'utf8'));
    const dataR = JSON.parse(fs.readFileSync(file_rus, 'utf8'));
    const dataT = JSON.parse(fs.readFileSync(file_tr, 'utf8'));
    for(let i=0; i < dataE.length; i++ ) {
      const english_data = dataE[i];
      const rus_data = dataR[i];
      const tr_data = dataT[i];
      let countryInstance = await country.findOne({where: {nameEn: english_data.countryName}});
      if (!countryInstance) {
        countryInstance = await country.create({
          nameEn: english_data.countryName,
          nameRu: rus_data.countryName,
          nameTr: tr_data.countryName,
          nameTm: tr_data.countryName
        });
        const cityAmount = english_data.cities.length;
        const cityAmount1 = rus_data.cities.length;
        const cityAmount2 = tr_data.cities.length;
        if (cityAmount !== cityAmount1 || cityAmount1 !== cityAmount2) {
          return res.status(404).json({message: "cities length not true"})
        }
        for (let i=0; i < cityAmount; i++) {
          let cityInstance = await city.findOne({where: {nameEn: english_data.cities[i]}});
          if (!cityInstance) {
            cityInstance = await city.create({
              nameEn: english_data.cities[i],
              nameRu: rus_data.cities[i],
              nameTr: tr_data.cities[i],
              nameTm: tr_data.cities[i],
              countryId: countryInstance.id
            })
          }
        }
      }      
    }
    res.status(200).json({ message: 'English countries saved successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while saving data.' });
  }
});


router.post('/countries/add-empty-city', async (req, res) => {
  try {
    const countries = await country.findAll();
    for (const country of countries) {
      const cities = await city.findOne({where: {countryId: country.id}});
      if (!cities){
        await city.create({
          nameEn: ' ',
          nameRu: ' ',
          nameTr: ' ',
          countryId: country.id
        })
        console.log(country.nameEn, ' city added')
      }
    }
    res.status(200).json({message: "Operation successfull"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error in getting add city"});
  }
})

router.post('/turkmen-countries', async (req, res) => {
  try {
    const countries = await country.findAll();
    for (const country of countries) {
      country.nameTm = country.nameTr;
      await country.save();
    }

    res.status(200).json({message: "Success"})
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error in getting add city"});
  }
})

router.post('/turkmen-cities', async (req, res) => {
  try {
    const countries = await city.findAll();
    for (const country of countries) {
      country.nameTm = country.nameTr;
      await country.save();
    }

    res.status(200).json({message: "Success"})
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error in getting add city"});
  }
})

// router.post('/countries/save/ru', async (req, res) => {
//   try {
//     const countryCount = await country.count();
//     const data = JSON.parse(fs.readFileSync(file_rus, 'utf8'));
//     if (data.length !== countryCount) {
//       throw new Error('The number of records in the JSON file does not match the number of records in the database.');
//     }
//     for (let i = 1; i < data.length; i++) {
//       const countryData = data[i];
//       // console.log(countryData);
//       const { countryName, cities } = countryData;

//       const countryInstance = await country.findByPk(i);
//       if (!countryInstance) {
//         continue;
//       }
//       // console.log(countryInstance.nameEn, countryName);
//       // countryInstance.nameRu = countryName;
//       // await countryInstance.save();
//       let array = []
//       const Cities = await city.findAll({where: {countryId: countryInstance.id}});
//       for (const citiName of Cities) {
//         const russianVersion = citiName.dataValues.nameEn;
//         const

//       }
      
      
//       // if (cities.length !== cityCount) {
//       //   throw new Error('The number of records in the JSON file does not match the number of records in the database.');
//       // }
      
//     }
//     res.status(200).json({ message: 'Russian countries saved successfully.' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'An error occurred while saving data.' });
//   }
// });


// router.post('/countries/save/tr', async (req, res) => {
//   try {
//     const countryCount = await country.count();
//     const data = JSON.parse(fs.readFileSync(file_tr, 'utf8'));
//     if (data.length !== countryCount) {
//       throw new Error('The number of records in the JSON file does not match the number of records in the database.');
//     }
//     for (let i = 0; i < data.length; i++) {
//       const countryData = data[i];
//       const { id, country, cities } = countryData;

//       const countryInstance = await country.findByPk(id);
//       if (!countryInstance) {
//         continue;
//       }

//       countryInstance.nameTr = country;
//       await countryInstance.save();

//       for (const cityData of cities) {
//         const { id, cityName } = cityData;

//         const cityInstance = await city.findByPk(id);
//         if (!cityInstance) {
//           continue;
//         }

//         cityInstance.nameTr = cityName;
//         await cityInstance.save();
//       }
//     }
//     res.status(200).json({ message: 'Turkish countries saved successfully.' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'An error occurred while saving data.' });
//   }
// });


module.exports = router;