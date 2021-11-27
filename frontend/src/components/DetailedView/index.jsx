import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';
//import { text } from 'stream/consumers';

function DetailedView({ data, xAxisAttr, categoryToFilterBy, yAxisAttr}) {
    const [image, setImage] = useState('');

    // only show current selected x and y axis, and filter
    var text_string = yAxisAttr + ": " + String(data[yAxisAttr]) + "\n";
    if (categoryToFilterBy != "" && categoryToFilterBy != null) {
        text_string = text_string + categoryToFilterBy + ": " + String(data[categoryToFilterBy]) + "\n";
    }
    text_string = text_string + xAxisAttr + ": " + String(parseFloat(data[xAxisAttr]).toFixed(2)) + "\n";


    useEffect(() => {
        const soundData = data.file_data.split(',').map(Number);
        const sampleRate = Number(data.sample_rate);
        Service.generateSpectrogram({ sound_data: soundData, sample_rate: sampleRate }).then(res => {
            console.log('received data from endpoint', data);
            setImage(res);
        });
    }, [data]);

  return (
      <div className="sm-DetailedView">
          <img src={image} width="260" height="240" />
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
