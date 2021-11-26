import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import * as d3 from 'd3';
import { lazy } from 'react';
import Service from '../../services/Service';

function DetailedView({ attributeTypes, data }) {
    if (data == '') {
        return null;
    }

    const [image, setImage] = useState('');
    const [soundKey, setSoundKey] = useState(attributeTypes.listical[0]);
    const [soundData, setSoundData] = useState(getSoundData(soundKey, data));

    

    console.log("sound data");
    console.log(soundData);

    // for now just deal with the first file
    // convert from string representation
    var first_file = soundData.split(",").map(Number);

    console.log("first file");
    console.log(first_file);

    useEffect(() => {
        Service.generateSpectrogram({ sound_data: first_file }).then(res => {
            setImage(res);
        });
    }, []);

    console.log("image", image);

  return (
      <div className="sm-DetailedView">
          {<img src={image} />}
    </div>
  );
}

function getSoundData(atName, sData) {
    // each value in values is a string representation of the sound data file
    const values = sData[atName];
    return values;
}

DetailedView.propTypes = {
    attributeTypes: PropTypes.shape({
        listical: PropTypes.array,
        ordinal: PropTypes.array,
        quantitative: PropTypes.array,
    }),
    data: PropTypes.array,
}

export default DetailedView;
