import React from "react";

const Footer = () => {
	return (
		<footer className='w-full grid grid-cols-2 p-4 text-[#869099]'>
			<div className='text-center'>
				<b className='text-xs font-bold '>
					For questions and comments, email us at{" "}
					<a href='mailto:psmo@pup.edu.ph' className='text-[#800000] underline'>
						psmo@pup.edu.ph
					</a>
				</b>
			</div>
			<div className='text-center text-xs flex items-center justify-center gap-1'>
				<a href='' className='text-[#800000] underline  '>
					Polytechnic University of the Philippines
				</a>{" "}
				|{" "}
				<a href='' className='text-[#800000] underline  '>
					Terms of Use
				</a>{" "}
				|{" "}
				<a href='' className='text-[#800000] underline  '>
					Privacy Statement
				</a>{" "}
				| <p className='text-[#800000]'>Version 1</p>
			</div>
		</footer>
	);
};

export default Footer;
