import State from '../models/State.js'
import City from '../models/City.js'
import Area from '../models/Area.js'


const addState = async(req,res)=>{
    try{
        const  {name} = req.body;
        if(!name){
            return res.status(400).json({success : false , message : "State name is required"});
        }

        const state = new State({name});
        await state.save();
        res.status(201).json({
            success : true,
            message : "State added successful",
            state 
        })
    }catch(err){
        res.status(500).json({
            success : false,
            error : err.message
        })
    }
}

const addCity = async(req,res)=>{
    try{
        const {name , stateId} = req.body;

        if(!name || !stateId){
            return res.status(400).json({success : false,message : "state or name is required"});
        }

        const stateExist = await State.findById(stateId);

        if(!stateExist){
            return res.status(404).json({success:false,message : "state not found"});
        }

        const city = new City({name ,state : stateId});
        await city.save();

        res.status(201).json({success : true, message : "city added successfully",city});



    }
    catch(err){
        res.status(500).json({success : false,error : err});
    }


}
const addArea = async(req,res)=>{
    try{
        const {name , cityId} = req.body;

        if(!name || !cityId){
            return res.status(400).json({success : false,message : "city or name is required"});
        }

        const cityExist = await City.findById(cityId);

        if(!cityExist){
            return res.status(404).json({success:false,message : "city not found"});
        }

        const area = new Area({name ,city : cityId});
        await area.save();

        res.status(201).json({success : true, message : "area added successfully",area});

    }
    catch(err){
        res.status(500).json({success : false,error : err});
    }
}

const getState = async(req,res)=>{
    try{
        const states = await State.find();
        res.status(200).json({success : true , states})
    }catch(err) {
        res.status(500).json({success : false , error : err.message })
    }
}

  const getCitiesByState = async(req,res)=>{

    try{
         const {id} = req.params;
      const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    const cities = await City.find({state : id});
      res.status(200).json({ success: true, cities });
    }
    catch(err){
      console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
    }
      
  }
    const getAreasByCities = async(req,res)=>{

    try{
         const {id} = req.params;
      const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    const areas = await Area.find({city : id});
      res.status(200).json({ success: true, areas });
    }
    catch(err){
      console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch areas' });
    }
      
  }
  const getCities = async(req,res)=>{

    try{
     
    const cities = await City.find();
      res.status(200).json({ success: true, cities });
    }
    catch(err){
      console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
    }
      
  }
  const getAreas = async(req,res)=>{

    try{
     
    const areas = await Area.find();
      res.status(200).json({ success: true, areas });
    }
    catch(err){
      console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
    }
      
  }

  const getLocationDetails = async(req,res)=>{
    try{
      const {state,city,area} = req.query;

      const stateObj = state ? await State.findById(state) : null;
      const cityObj = city ? await City.findById(city) : null;
      const areaObj = area ? await Area.findById(area) : null;

      res.status(200).json({
        success : true,
        state: stateObj ? stateObj.name : null,
        city: cityObj ? cityObj.name : null,
        area: areaObj ? areaObj.name : null,
      });

    }
     catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
  }

export {addState,addCity, addArea,getState
  ,getCitiesByState,getAreasByCities,getCities ,getAreas,getLocationDetails};



