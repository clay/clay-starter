'use strict';

const moment = require('moment');

function getPrettyMonthAbrev(month) {
  switch (month) {
    case 'May':
      return month;
      break;
    case 'Jun':
      return 'June';
      break;
    case 'Jul':
      return 'July';
      break;
    case 'Sep':
      return 'Sept.';
      break;
    default:
      return month + '.';
      break;
  }
}

module.exports = date => {
  const mDate = moment(date),
    now = moment();

  if (!mDate.isValid(date)) {
    return '';
  }

  if (moment.duration(now.diff(mDate)).asDays() < 1) {
    return `${mDate.format('h:mm')} ${mDate.format('A')}`;
  } else {
    return `${getPrettyMonthAbrev(mDate.format('MMM'))} ${mDate.format('D, YYYY')}`;
  }
};
