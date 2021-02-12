import React from 'react';

interface Props {
  year: number;
}

class Footer extends React.Component<Props> {
  rsSchoolLink = <a className="rsschool" href="https://rs.school/js/" target="_blank" rel="noreferrer"> </a>;

  githubLink = <a href="https://github.com/AlexeyTeterin" target="_blank" rel="noreferrer">Alexey Teterin</a>;

  copyRight = (year: number) => (
    <div>
      &copy;
      {' '}
      {year}
      {' '}
      coded by&nbsp;
      {this.githubLink}
    </div>
  );

  render = () => (
    <div className="wrapper">
      {this.rsSchoolLink}
      {this.copyRight(this.props.year)}
    </div>
  );
}

export default Footer;
