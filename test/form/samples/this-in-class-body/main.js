class Unused {
	static flag = false
	static mutate = () => {
		this.flag = true;
	}
}
Unused.mutate();

class Used {
	static flag = false
	static mutate = () => {
		this.flag = true;
	}
}
Used.mutate();

if (Used.flag) console.log('retained');
else console.log('unimportant');

class InstanceMutation {
	static flag = false
	flag = false
	mutate = () => {
		this.flag = true;
	}
}
(new InstanceMutation).mutate();

if (InstanceMutation.flag) console.log('removed');
else console.log('retained');

class UsedSuper {
	static flag = false
}
class UsedWithSuper extends UsedSuper{
	static mutate = () => {
		super.flag = true;
	}
}
UsedWithSuper.mutate();

if (UsedWithSuper.flag) console.log('retained');
else console.log('unimportant');

// Assignments via "super" do NOT mutate the super class!
if (UsedSuper.flag) console.log('removed');
else console.log('retained');
