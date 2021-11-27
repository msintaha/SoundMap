import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';
//import { text } from 'stream/consumers';

function DetailedView({ attributeTypes, data }) {
    const [image, setImage] = useState('');

    // set the text value details
    const ordinals = attributeTypes.ordinal;
    const quantitative = attributeTypes.quantitative;

    var text_string = "";

    console.log("ordinals 0", data[ordinals[0]]);
    for (var i = 0; i < ordinals.length; i++) {
        text_string = text_string + ordinals[i] + ": " + String(data[ordinals[i]]) + "\n";
    }
    for (var i = 0; i < quantitative.length; i++) {
        text_string = text_string + quantitative[i] + ": " +  String(parseFloat(data[quantitative[i]]).toFixed(2)) + "\n";
    }

    useEffect(() => {
        const soundData = data.file_data.split(',').map(Number);
        console.log(soundData);
        Service.generateSpectrogram({ sound_data: soundData }).then(res => {
            console.log('received data from endpoint', data);
            setImage(res);
        });
    }, [data]);

  return (
      <div className="sm-DetailedView">
          <img src={image} width="300" height="280" />
          <div id="MoreInfo">
              {text_string}
          </div>
    </div>
  );
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
