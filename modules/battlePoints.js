// user1 should be you, user2 is the other guy
// return 0 if you win, 1 if the other guy won
module.exports = function(user1, user2) {

	while (user1 > 0 && user2 > 0) {
		user1_points = Math.floor((Math.random() * 10) + 1);
		user2_points = Math.floor((Math.random() * 10) + 1);
		if (user1_points > user2_points) {
			user2 = user2 - 1;
		}
		if (user2_points > user1_points) {
			user1 = user1 - 1;
		}
	}
	if (user1 > 0) {
		return 0;
	}
	if (user2 > 0) {
		return 1;
	}

};