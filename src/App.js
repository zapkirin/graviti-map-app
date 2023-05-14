import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  VStack,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  Image,
  Radio,
  RadioGroup,
} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import {useJsApiLoader,GoogleMap,Marker,Autocomplete,DirectionsRenderer} from '@react-google-maps/api'
import React, { useEffect, useState } from 'react';

const center= {lat:19.0760, lng:72.8777}
const libraries = ["places"];

function App() {
 // API key as a variable
 const googleMapsApiKey = "AIzaSyADH18ZiQjJ1AmPl7lJjgxZhK6U130D13E";

 // Pass API key and libraries to the hook
 
 const { isLoaded } = useJsApiLoader({
   googleMapsApiKey,
   libraries,
 });

 const[map,setMap]=useState(/** @type google.maps.Map */(null))
const [directionsResponse, setDirectionsResponse] = useState(null)
const[distance,setDistance]=useState('')
const[duration,setDuration]=useState('')
const [eta,setEta]=useState("");
const [transitMode,setTransitMode]=useState("");
const [selectedTransitMode,setSelectedTransitMode]=useState("");


 // Declare refs for the input elements
 /**@type React.MutableRefObject<HTMLInputElement> */
 const originRef = React.useRef();
 /**@type React.MutableRefObject<HTMLInputElement> */
 const destinationRef = React.useRef();

 // Declare functions for loading and selecting places
 const onLoadOrigin = (autocomplete) => {
   // Bind the autocomplete service to the origin input
   autocomplete.bindTo("origin", originRef.current);
 };

 const onLoadDestination = (autocomplete) => {
   // Bind the autocomplete service to the destination input
   autocomplete.bindTo("destination", destinationRef.current);
 };

 const onPlaceChangedOrigin = () => {
   // Get the place details from the origin input
   const place = originRef.current.getPlace();

   // Do something with the place details
   console.log(place);
 };

 const onPlaceChangedDestination = () => {
   // Get the place details from the destination input
   const place = destinationRef.current.getPlace();

   // Do something with the place details
   console.log(place);
 };
// Add useEffect hook to update selected transit mode when user changes it

useEffect(()=>{
  // Check if the google object is loaded
  if(isLoaded){
  // eslint-disable-next-line no-undef
  setSelectedTransitMode(google.maps.TransitMode.TRAIN);// Set default transit mode to train
  }
 },[isLoaded]);// Pass isLoaded as dependency array to run when it changes

  if(!isLoaded){
    return <SkeletonText/>
  }

  async function calculateRoute(){
    if(originRef.current.value==='' || destinationRef.current.value==='')
    {
      return
    }
    // eslint-disable-next-line no-undef
    const directionService=new google.maps.DirectionsService()
    const results= await directionService.route({
      origin:originRef.current.value,
      destination:destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode:google.maps.TravelMode.TRANSIT,
      transitOptions: {// Add transit options object
        // eslint-disable-next-line no-undef
        modes: ['BUS','TRAIN','SUBWAY','TRAM','RAIL'],// Set transit mode to train
        departureTime: new Date(),// Set departure time to current time
      },
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    // Set eta and transit mode from results
setEta(results.routes[0].legs[0].arrival_time.text);
if (results.routes[0].legs[0].steps[0].transitDetails) {
  setTransitMode(results.routes[0].legs[0].steps[0].transitDetails.line.vehicle.type);
}

  }

  function clearRoute(){
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    setEta("");
setTransitMode("");
    originRef.current.value=''
    destinationRef.current.value=''

  }

  // Add useEffect hook to update selected transit mode when user changes it


  return (
    <>
    <HStack>
      <Image display={{base:'none',lg:'flex'}} boxSize='100px' ml='20px' objectFit='contain' src="https://tms.graviti.in/media/images/graviti-logo.png" alt='graviti'/>
    </HStack>
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
    backgroundColor='#F4F8FA'
      h='100vh'
      w='100vw'
    >
      <Text color='#1B31A8' fontSize='20px' fontWeight='600'>Let's calculate distance and duration from Google maps</Text>
      <Box position={{ base: "relative", lg: "absolute" }}
          left={{ lg: "50%" }}
          top={{ lg: "5%" }}
          h={{ base: "100%", lg: "80%" }}
          w={{ base: "100%", lg: "40%" }}>
        <GoogleMap center={center} zoom={15} mapContainerStyle={{width:'100%',height:'100%'}}
        options={{
          zoomControl:false,
          streetViewControl:false,
          mapTypeControl:false,
          fullscreenControl:false
        }}
        onLoad={(map)=>setMap(map)}>
        <Marker position={center}/>
        {directionsResponse && <DirectionsRenderer directions={directionsResponse}/>}
        </GoogleMap>
        
      </Box>

      <Box
        p={4}
        borderRadius='lg'
        mt={5}
        bgColor='white'
        shadow='base'
        minW={{ base: "90%", lg: "container.md" }}
zIndex="modal"
position={{ base: "static", lg: "relative" }}
right={{ lg: "25%" }}
h={{ base: "auto", lg: "740px" }}
w={{ base: "auto", lg: "500px" }}
      >
        <VStack spacing={2} display='flex' alignItems='flex-start'>
          <Text>Origin</Text>
          <Autocomplete onLoad={onLoadOrigin} onPlaceChanged={onPlaceChangedOrigin}>
              <Input type='text' placeholder='Origin' w='100%' ref={originRef} />
          </Autocomplete>
          <Text>Destination</Text>
          <Autocomplete onLoad={onLoadDestination} onPlaceChanged={onPlaceChangedDestination}>
          <Input type='text' placeholder='Destination' w='100%' ref={destinationRef}/>
          </Autocomplete>
          
            <Text>Transit Mode</Text>
            <RadioGroup onChange={(value)=>setSelectedTransitMode(value)} value={selectedTransitMode}>
            <HStack spacing='24px'>
            <Radio value='BUS'>Bus</Radio>
            <Radio value='TRAIN'>Train</Radio>
            <Radio value='SUBWAY'>Subway</Radio>
            <Radio value='TRAM'>Tram</Radio>
            <Radio value='RAIL'>Rail</Radio>
            </HStack>
            </RadioGroup>

          <ButtonGroup mt={4} position={'absolute'}
          left={{ base:'30%',lg:'50%'}} top={{base:'58%',lg:'10%'}}>
            <Button colorScheme='blue' type='submit' borderRadius='100px' onClick={calculateRoute}>
              Calculate
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </VStack>
        <VStack spacing={4} mt={4} display='flex' alignItems='flex-start' justifyContent='space-between'>
          <Box p={4}
        borderRadius='lg'
        mt={5}
        bgColor='white'
        shadow='base'
        // minW='container.md'
        display='flex'
        flexDirection='column'
        
        w='70%'
      >
          Distance: <Text color="#0079FF" fontSize='30' fontWeight='700'>{distance}</Text>
        </Box>

        <Box p={4}
        borderRadius='lg'
        mt={5}
        bgColor='white'
        shadow='base'
        
         w='70%' >
          Duration: <Text color="#0079FF" fontSize='30' fontWeight='700'>{duration}</Text>
          </Box>
          <Box p={4} borderRadius='lg' mt={5} bgColor='white' shadow='base' w='70%'>
ETA:<Text color="#0079FF" fontSize='30' fontWeight='700'>{eta}</Text>
</Box>

          <IconButton
          position='absolute'
          top={{base:'25%',lg:'9%'}} right={{base:'10%',lg:'51%'}}
          aria-label='center back'
          icon={<FaLocationArrow/>}
          isRound
          onClick={()=>map.panTo(center)}/>
        </VStack>
        <Text>The distance and duration via the seleted route is {distance} and {duration} respectively. ETA is {eta}.</Text>
      </Box>
      
    </Flex>
    </>
  )
}

export default App