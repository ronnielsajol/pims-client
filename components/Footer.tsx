import React from "react";

const Footer = () => {
	return (
		<footer className='w-full grid grid-cols-2 max-xl:grid-cols-1 max-xl:grid-rows-3 p-4 text-[#869099]'>
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
				| <span className='text-[#800000] max-xl:hidden'>Version 1</span>
			</div>
<<<<<<< desktop-httponly
			<div className='hidden text-center text-xs max-xl:flex items-center justify-center gap-1 text-[#800000]'>
=======
			<div className='laptop:hidden text-center text-xs flex items-center justify-center gap-1 text-[#800000]'>
>>>>>>> main
				<span>Version 1</span>
			</div>
		</footer>
	);
};

export default Footer;
