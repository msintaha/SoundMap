import React, { useEffect, useState, useHasChanged } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';

function DetailedView({ data, xAxisAttr, categoryToFilterBy, yAxisAttr}) {
    const [image, setImage] = useState('');

    useEffect(() => {
			const soundData = data.file_data.split(',').map(Number);
			const sampleRate = Number(data.sample_rate);
			Service.generateSpectrogram({ sound_data: soundData, sample_rate: sampleRate }).then(res => {
					setImage(res);
			});
    }, [data]);

  return (
    <div className="sm-DetailedView">
			<img src={image} className="sm-DetailedView-spectrogram" />
			<div className="sm-DetailedView-metadata">
					<div><strong>{yAxisAttr}:</strong> {data[yAxisAttr]}</div>
					<div><strong>{xAxisAttr}:</strong> {parseFloat(data[xAxisAttr]).toFixed(2)}</div>
					<div><strong>{categoryToFilterBy}:</strong> {data[categoryToFilterBy]}</div>
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
	data: PropTypes.object,
}

export default DetailedView;
