import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';

function DetailedView({ attributeTypes, data }) {
    const [image, setImage] = useState('');
    const [soundKey, setSoundKey] = useState(attributeTypes.listical[0]);
    const [soundData, setSoundData] = useState(getSoundData(soundKey, data));

    useEffect(() => {
        const soundData = data.file_data.split(',').map(Number);
        console.log(soundData);
        Service.generateSpectrogram({ sound_data: soundData }).then(res => {
            console.log('received data from endpoint', data);
            setImage(res);
        });
    }, [data]);

    console.log("image", image);

  return (
      <div className="sm-DetailedView">
          <img src={image} width="300" height="280" />
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
