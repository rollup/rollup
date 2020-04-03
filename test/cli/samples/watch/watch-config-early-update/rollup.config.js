
			import path from 'path';
		  import fs from 'fs';
		  const messageFile = path.resolve(__dirname, '_actual', 'message.txt');
		  export default new Promise(resolve => {
		    fs.writeFileSync(messageFile, 'loading');
		    const watcher = fs.watch(messageFile, event => {
		      if (event === 'change') {
		        const content = fs.readFileSync(messageFile, 'utf8');
		        if (content === 'loaded') {
		          watcher.close();
		          fs.writeFileSync(messageFile, 'resolved');
		          resolve({
		            input: {output1: "main.js"},
		            output: {
		              dir: "_actual",
		              format: "es"
		            }
		          });
		        }
		      }
		    });
		  });
		