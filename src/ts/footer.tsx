import React from 'react';

const rsSchoolLink = () => (
  <div>
    <a className="rsschool" href="https://rs.school/js/" target="_blank" rel="noreferrer"></a>
  </div>
);

const copyRight = () => (
  <div>
    &copy; 2021, coded by&nbsp;
    <a href="https://github.com/AlexeyTeterin" target="_blank" rel="noreferrer">Alexey Teterin</a>
  </div>
);

const footer = () => (
  <div>
    {rsSchoolLink()}
    {copyRight()}
  </div>
);

export default footer;
