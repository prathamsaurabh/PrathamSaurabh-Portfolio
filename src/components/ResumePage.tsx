const PDF = '/Pratham_Saurabh_resume.pdf';
// Image render of the PDF (regenerate with: pdftoppm -png -r 240 -singlefile public/Pratham_Saurabh_resume.pdf public/resume)
const IMG = '/resume.png';

export default function ResumePage() {
  return (
    <section className="resume-page">
      <div className="resume-bar">
        <h2 className="label">Resume</h2>
        <div className="resume-actions">
          <a className="btn" href={PDF} target="_blank" rel="noreferrer">
            Open <span aria-hidden="true">↗</span>
          </a>
          <a className="btn solid" href={PDF} download>
            Download <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {/* Shown as a full page image so the whole resume is visible while scrolling */}
      <a className="resume-sheet" href={PDF} target="_blank" rel="noreferrer" title="Open PDF">
        <img src={IMG} alt="Pratham Saurabh resume" width={2040} height={2640} />
      </a>
    </section>
  );
}
