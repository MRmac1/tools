/**
 * file: 相册按日期分类
 *
 * createTime 2020年09月07日11:53:36
 * author qinglu
 */
import fs from 'fs';
import path from 'path';

// import Table from 'cli-table';
import archy from 'archy';
import Walker from 'walker';

const photoPath = path.join('/Users/qinglu/Documents/日常/DCIM/100CANON');

// const photoDir = fs.readdirSync(photoPath);

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  return [year, month].join('-');
}

const photoWalker = function(photoPath) {
  const photoMonthMap = new Map();
  return Walker(photoPath)
    .on('file', function(file, stat) {
      if (file.endsWith('.JPG')) {
        const fileCreatedDate = formatDate(stat.birthtime);
        if (photoMonthMap.has(fileCreatedDate)) {
          const dateFiles = photoMonthMap.get(fileCreatedDate);
          photoMonthMap.set(fileCreatedDate, [...dateFiles, file])
        } else {
          photoMonthMap.set(fileCreatedDate, [file])
        }
      }
    })
    .on('error', function(er, entry, stat) {
      console.log('Got error ' + er + ' on entry ' + entry)
    })
    .on('end', function() {
      console.log('All files traversed.', photoMonthMap)
    })
}


photoWalker(photoPath)


