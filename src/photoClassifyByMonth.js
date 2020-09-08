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
import { ExifImage } from 'exif';


const photoPath = path.join(__dirname, '../test');
// const photoPath = path.join('/Users/mr_mac1/Documents/文档/生活/照片');

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


function getExifDate(file) {
  return new Promise((resolve) => {
    new ExifImage({ image : file }, function (error, exifData) {
      if (error) {
        return resolve({})
      } else {
        return resolve(exifData);
      }
    });
  })
}

const photoWalker = function(photoPath) {
  const photoMonthMap = new Map();
  return Walker(photoPath)
    .on('file', async function(file, stat) {
      if (file.endsWith('.jpg')) {
        const photoInfo = await getExifDate(file);

        let fileCreatedDate;

        if (!photoInfo.exif) {
          // 没有 exif 信息取 stat.brithtime
          console.log('stat', stat.brithtime);
          fileCreatedDate = formatDate(stat.brithtime);
        } else {
          const photoExif = photoInfo.exif;
          console.log('photoExif.CreateDate', photoExif.CreateDate)
          console.log('photoExif.CreateDate type', typeof photoExif.CreateDate)
          const [year, month] = `${photoExif.CreateDate}`.replaceAll(':', '-').split('-')
          fileCreatedDate = `${year}-${month}`;
        }
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


