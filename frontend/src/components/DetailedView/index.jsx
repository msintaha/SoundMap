import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';

function DetailedView({ data, xAxisAttr, categoryToFilterBy, yAxisAttr}) {
    const [image, setImage] = useState('');
    // note: current bug, when beeswarm is reloaded the emphasised circle radius reverts back
    // also: should adjust the size of this and maybe also the summary view, since they are too big together to fit properly

    
    // only show current selected x and y axis, and filter
    var text_string = yAxisAttr + ": " + String(data[yAxisAttr]) + "\n";
    console.log("filter", categoryToFilterBy);
    if (categoryToFilterBy != "" && categoryToFilterBy != null) {
        text_string = text_string + categoryToFilterBy + ": " + String(data[categoryToFilterBy]) + "\n";
    }
    text_string = text_string + xAxisAttr + ": " + String(parseFloat(data[xAxisAttr]).toFixed(2)) + "\n";


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
