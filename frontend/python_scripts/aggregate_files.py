import xlsxwriter
import sys

from os import listdir
from os.path import isfile, join


STIMULUS_MAP = {
	'B': 'Brushing',
	'F': 'Waiting for food',
	'I': 'Isolation in unfamiliar environment'
}

BREED_MAP = {
	'MC': 'Main Coon',
	'EU': 'European Shorthair'
}

SEX_MAP = {
	'FI': 'Female, Intact',
	'FN': 'Female, Neutered',
	'MI': 'Male Intact',
	'MN': 'Male, Neutered'
}


def add_headers(worksheet):
	worksheet.write(0, 0, 'Filename')
	worksheet.write(0, 1, 'Cat ID')
	worksheet.write(0, 2, 'Cat Owner ID')
	worksheet.write(0, 3, 'Stimulus')
	worksheet.write(0, 4, 'Breed')
	worksheet.write(0, 5, 'Sex')
	worksheet.write(0, 6, 'Vocalization Counter')


def extract_data(path):
	onlyfiles = [str(f) for f in listdir(path) if isfile(join(path, f))]
	sorted_files = sorted(onlyfiles)
	workbook = xlsxwriter.Workbook('SoundmapDataset.xlsx')

	worksheets = ['1', '2', '3']
	for worksheet_id in worksheets:
		worksheet = workbook.add_worksheet('Recording Session {}'.format(worksheet_id))
		
		row = 1

		add_headers(worksheet)
		for filename in sorted_files:
			[stimulus, cat_id, breed, sex, cat_owner_id, session_and_counter] = filename.split('_')

			# Filename	Stimulus	Breed	Cat ID	Sex	Cat Owner ID	Vocalization Counter
			if session_and_counter.startswith(worksheet_id):
				worksheet.write(row, 0, filename)
				worksheet.write(row, 1, cat_id)
				worksheet.write(row, 2, cat_owner_id)
				worksheet.write(row, 3, STIMULUS_MAP[stimulus])
				worksheet.write(row, 4, BREED_MAP[breed])
				worksheet.write(row, 5, SEX_MAP[sex])
				worksheet.write(row, 6, '{}{}'.format(session_and_counter[1], session_and_counter[2]))
				row += 1
			
     
	workbook.close()

if __name__ == '__main__':
	dataset_path = sys.argv[1]
	extract_data(dataset_path)
