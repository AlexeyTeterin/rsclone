import React from 'react';

class Footer extends React.Component {
  rsSchoolLink = <a className="rsschool" href="https://rs.school/js/" target="_blank" rel="noreferrer"></a>;

  githubLink = <a href="https://github.com/AlexeyTeterin" target="_blank" rel="noreferrer">Alexey Teterin</a>;

  copyRight = (year) => (
    <div>
      &copy; {year} coded by&nbsp;
      {this.githubLink}
    </div>
  );

  render = () => (
    <div className='wrapper'>
      {this.rsSchoolLink}
      {this.copyRight(this.props.year)}
    </div>
  );
}

export default Footer;
