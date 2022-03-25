import { StyleSheet, Text, View } from "react-native";
import React, { useRef, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import tw from "tailwind-react-native-classnames";
import { Dimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MapViewDirections from "react-native-maps-directions";

import {
  selectDestination,
  selectOrigin,
  setTravelTimeInformation,
} from "../slices/navSlice";
import { GOOGLE_MAPS_APIKEY } from "@env";

const Map = () => {
  const { location, description } = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location || !destination) return;

    mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  }, [location, destination]);

  useEffect(() => {
    if (!location || !destination) return;

    const getTravelTime = async () => {
      fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperia&origins=${description}&destinations=${destination.description}&key=${GOOGLE_MAPS_APIKEY}`
      )
        .then((resp) => resp.json())
        .then((data) => {
          console.log(data);
          dispatch(
            setTravelTimeInformation(
              data?.rows[0]?.elements[0]?.status !== "ZERO_RESULTS"
                ? data.rows[0].elements[0]
                : null
            )
          );
        })
        .catch((err) => console.log(err));
    };

    getTravelTime();
  }, [location, destination, GOOGLE_MAPS_APIKEY]);

  return (
    <View>
      <MapView
        ref={mapRef}
        style={(tw`flex-1`, styles.map)}
        mapType="mutedStandard"
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && destination?.location && (
          <MapViewDirections
            origin={description}
            destination={destination.description}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="black"
          />
        )}

        {location && (
          <Marker
            coordinate={{
              latitude: location.lat,
              longitude: location.lng,
            }}
            title="Your place"
            description={description}
            identifier="origin"
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.location.lat,
              longitude: destination.location.lng,
            }}
            title="Your place"
            description={destination.description}
            identifier="destination"
          />
        )}
      </MapView>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get("window").height / 2,
  },
});
